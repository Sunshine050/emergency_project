import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(NotificationGateway.name);
  private userSocketMap: Map<string, Set<string>> = new Map();
  private broadcastLocks: Set<string> = new Set();

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Notification WebSocket Gateway initialized on namespace /notifications');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Missing token from client ${client.id}`);
        this.disconnect(client, 'Missing token');
        return;
      }

      const payload = await this.validateToken(token);
      if (!payload) {
        this.logger.warn(`Invalid or expired token for client ${client.id}`);
        this.disconnect(client, 'Invalid or expired token');
        return;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.warn(`User ${payload.sub} not found for client ${client.id}`);
        this.disconnect(client, 'User not found');
        return;
      }

      const userId = payload.sub;
      this.storeUserSocket(userId, client.id);
      client.join(`user:${userId}`);

      if (payload.role) {
        client.join(`role:${payload.role}`);
        this.logger.log(`Client ${client.id} joined role:${payload.role}`);
      }

      this.logger.log(`Client ${client.id} connected for user ${userId}`);
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}: ${error.message}`, error.stack);
      this.disconnect(client, 'Authentication failed');
    }
  }

  handleDisconnect(client: Socket) {
    const socketId = client.id;
    this.removeUserSocket(socketId);
    this.logger.log(`Client disconnected: ${socketId}`);
  }

  private extractToken(client: Socket): string | null {
    const tokenFromAuth = client.handshake.auth?.token;
    const tokenFromHeader = client.handshake.headers?.authorization?.replace('Bearer ', '').trim();
    const token = tokenFromAuth || tokenFromHeader;
    if (!token) {
      this.logger.warn('No token provided in handshake');
      return null;
    }
    return token;
  }

  private async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = await this.authService.validateToken(token);
      if (!payload || !payload.sub || !payload.role) {
        this.logger.warn(`Invalid payload structure: ${JSON.stringify(payload)}`);
        return null;
      }
      return payload as TokenPayload;
    } catch (err) {
      this.logger.warn(`Token validation failed: ${err.message}`);
      return null;
    }
  }

  private storeUserSocket(userId: string, socketId: string) {
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set());
    }
    this.userSocketMap.get(userId)?.add(socketId);
    this.logger.log(`Stored socket ${socketId} for user ${userId}`);
  }

  private removeUserSocket(socketId: string) {
    for (const [userId, sockets] of this.userSocketMap.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSocketMap.delete(userId);
        }
        this.logger.log(`Removed socket ${socketId} for user ${userId}`);
        break;
      }
    }
  }

  private disconnect(client: Socket, reason: string) {
    client.emit('error', { message: reason });
    client.disconnect(true);
    this.logger.log(`Client ${client.id} disconnected due to: ${reason}`);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.logger.log(`Sending ${event} to user:${userId} - Data: ${JSON.stringify(data)}`);
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToRole(role: string, event: string, data: any) {
    this.logger.log(`Sending ${event} to role:${role} - Data: ${JSON.stringify(data)}`);
    this.server.to(`role:${role}`).emit(event, data);
  }

  broadcastEmergency(data: any) {
    const payload = {
      id: data.id,
      type: data.type,
      grade: data.grade,
      location: data.location,
      coordinates: data.coordinates,
      assignedTo: data.assignedTo,
    };
    const lockKey = `emergency:${payload.id}`;
    if (this.broadcastLocks.has(lockKey)) return;
    this.broadcastLocks.add(lockKey);

    this.logger.log(`Broadcasting emergency event: ${JSON.stringify(payload)}`);
    this.server
      .to('role:EMERGENCY_CENTER')
      .to('role:HOSPITAL')
      .to('role:RESCUE_TEAM')
      .emit('emergency', payload);

    // ส่ง event stats-updated หลังจากมีเคสฉุกเฉินใหม่
    this.broadcastStatsUpdated();

    setTimeout(() => this.broadcastLocks.delete(lockKey), 1000);
  }

  broadcastStatusUpdate(data: { emergencyId: string; status: string; assignedTo?: string }) {
    const payload = {
      emergencyId: data.emergencyId,
      status: data.status,
      assignedTo: data.assignedTo,
    };
    const lockKey = `status:${data.emergencyId}`;
    if (this.broadcastLocks.has(lockKey)) return;
    this.broadcastLocks.add(lockKey);

    this.logger.log(`Broadcasting status-update event: ${JSON.stringify(payload)}`);
    this.server
      .to('role:EMERGENCY_CENTER')
      .to('role:HOSPITAL')
      .to('role:RESCUE_TEAM')
      .emit('status-update', payload);

    if (data.assignedTo) {
      this.sendToUser(data.assignedTo, 'status-update', payload);
    }

    // ส่ง event stats-updated หลังจากสถานะเปลี่ยน
    this.broadcastStatsUpdated();

    setTimeout(() => this.broadcastLocks.delete(lockKey), 1000);
  }

  broadcastHospitalCreated(data: { id: string; name: string }) {
    const payload = {
      id: data.id,
      name: data.name,
    };
    const lockKey = `hospital:${data.id}`;
    if (this.broadcastLocks.has(lockKey)) return;
    this.broadcastLocks.add(lockKey);

    this.logger.log(`Broadcasting hospital-created event: ${JSON.stringify(payload)}`);
    this.server
      .to('role:EMERGENCY_CENTER')
      .emit('hospital-created', payload);

    // ส่ง event stats-updated หลังจากสร้างโรงพยาบาลใหม่
    this.broadcastStatsUpdated();

    setTimeout(() => this.broadcastLocks.delete(lockKey), 1000);
  }

  // เพิ่ม method ใหม่เพื่อคำนวณ stats และ broadcast
  public async broadcastStatsUpdated() {
    const stats = await this.calculateStats();
    const lockKey = `stats:${Date.now()}`; // ใช้ timestamp เพื่อป้องกันการส่งซ้ำ
    if (this.broadcastLocks.has(lockKey)) return;
    this.broadcastLocks.add(lockKey);

    this.logger.log(`Broadcasting stats-updated event: ${JSON.stringify(stats)}`);
    this.server
      .to('role:EMERGENCY_CENTER')
      .emit('stats-updated', stats);

    setTimeout(() => this.broadcastLocks.delete(lockKey), 1000);
  }

  // คำนวณ stats เพื่อส่งผ่าน WebSocket
  private async calculateStats() {
    const [
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      activeTeams,
      hospitals,
      criticalCases,
      cancelledEmergencies,
      responseTimes,
      hospitalCapacities,
    ] = await Promise.all([
      this.prisma.emergencyRequest.count(),
      this.prisma.emergencyRequest.count({
        where: {
          status: {
            in: [
              'PENDING',
              'ASSIGNED',
              'IN_PROGRESS',
            ],
          },
        },
      }),
      this.prisma.emergencyRequest.count({
        where: { status: 'COMPLETED' },
      }),
      this.prisma.organization.count({
        where: { type: 'RESCUE_TEAM', status: 'ACTIVE' },
      }),
      this.prisma.organization.count({
        where: { type: 'HOSPITAL', status: 'ACTIVE' },
      }),
      this.prisma.emergencyRequest.count({
        where: { medicalInfo: { path: ['severity'], equals: 4 } },
      }),
      this.prisma.emergencyRequest.count({
        where: { status: 'CANCELLED' },
      }),
      this.prisma.emergencyResponse.findMany({
        where: { status: 'COMPLETED' },
        select: {
          dispatchTime: true,
          completionTime: true,
        },
      }),
      this.prisma.organization.findMany({
        where: { type: 'HOSPITAL', status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          medicalInfo: true,
        },
      }),
    ]);

    let averageResponseTime = 0;
    if (responseTimes.length > 0) {
      const totalResponseTime = responseTimes.reduce((sum, response) => {
        if (response.dispatchTime && response.completionTime) {
          const diffMs =
            new Date(response.completionTime).getTime() -
            new Date(response.dispatchTime).getTime();
          return sum + diffMs / (1000 * 60);
        }
        return sum;
      }, 0);
      averageResponseTime = totalResponseTime / responseTimes.length;
    }

    let availableHospitalBeds = 0;
    hospitalCapacities.forEach((hospital: any) => {
      if (hospital.medicalInfo && typeof hospital.medicalInfo.availableBeds === 'number') {
        availableHospitalBeds += hospital.medicalInfo.availableBeds;
      }
    });

    return {
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      activeTeams,
      connectedHospitals: hospitals,
      criticalCases,
      averageResponseTime: Number(averageResponseTime.toFixed(2)),
      availableHospitalBeds,
      cancelledEmergencies,
    };
  }
}