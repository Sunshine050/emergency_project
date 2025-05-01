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
  sub: string; // User ID from JWT
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

      const userId = payload.sub; // ใช้ sub เป็น user ID โดยตรง
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
    const auth = client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (!auth) return null;
    return auth.replace('Bearer ', '').trim() || null;
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
  }

  private removeUserSocket(socketId: string) {
    for (const [userId, sockets] of this.userSocketMap.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSocketMap.delete(userId);
        }
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
    this.logger.log(`Broadcasting emergency event: ${JSON.stringify(payload)}`);
    this.server
      .to('role:EMERGENCY_CENTER')
      .to('role:HOSPITAL')
      .to('role:RESCUE_TEAM')
      .emit('emergency', payload);
  }

  broadcastStatusUpdate(data: { emergencyId: string; status: string; assignedTo?: string }) {
    const payload = {
      emergencyId: data.emergencyId,
      status: data.status,
      assignedTo: data.assignedTo,
    };
    this.logger.log(`Broadcasting status-update event: ${JSON.stringify(payload)}`);
    this.server
      .to('role:EMERGENCY_CENTER')
      .to('role:HOSPITAL')
      .to('role:RESCUE_TEAM')
      .emit('status-update', payload);

    if (data.assignedTo) {
      this.sendToUser(data.assignedTo, 'status-update', payload);
    }
  }
}