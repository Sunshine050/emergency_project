import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  namespace: '/', // เปลี่ยนจาก '/notifications' เป็น '/' เพื่อให้ตรงกับ frontend
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  path: '/socket.io', // ใช้ path เดียวกับ frontend
  pingInterval: 10000,
  pingTimeout: 5000,
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap: Map<string, string[]> = new Map();
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // ดึง token จาก handshake
      const token = client.handshake.auth.token || 
                    client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`No token provided for WebSocket connection: ${client.id}`);
        throw new UnauthorizedException('No token provided');
      }

      // ตรวจสอบ token
      const payload = await this.authService.verifyToken(token);
      if (!payload || !payload.sub) {
        this.logger.warn(`Invalid token payload for client ${client.id}`);
        throw new UnauthorizedException('Invalid token');
      }

      // เก็บ userId และ role ใน socket.data
      client.data.user = payload;
      const userId = payload.sub;

      // เก็บ socket ใน userSocketMap
      const userSockets = this.userSocketMap.get(userId) || [];
      userSockets.push(client.id);
      this.userSocketMap.set(userId, userSockets);

      // Join user-specific room
      client.join(`user:${userId}`);

      // Join role-specific room
      if (payload.role) {
        client.join(`role:${payload.role}`);
      }

      this.logger.log(`Client connected: ${client.id}, User: ${userId}, Role: ${payload.role}`);
    } catch (error: any) {
      this.logger.error(`Connection error for client ${client.id}: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (userId) {
      const userSockets = this.userSocketMap.get(userId) || [];
      const updatedSockets = userSockets.filter((id) => id !== client.id);
      if (updatedSockets.length === 0) {
        this.userSocketMap.delete(userId);
      } else {
        this.userSocketMap.set(userId, updatedSockets);
      }
      this.logger.log(`Client disconnected: ${client.id}, User: ${userId}`);
    } else {
      this.logger.log(`Client disconnected: ${client.id} (no user data)`);
    }
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.logger.log(`Received message from ${client.id}: ${JSON.stringify(data)}`);
    this.server.emit('message', { user: client.data.user, data });
    return { success: true, message: 'Message received' };
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ) {
    if (data.channel) {
      client.join(data.channel);
      this.logger.log(`Client ${client.id} subscribed to channel: ${data.channel}`);
      return { success: true, channel: data.channel };
    }
    this.logger.warn(`Client ${client.id} failed to subscribe: Channel required`);
    return { success: false, message: 'Channel required' };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ) {
    if (data.channel) {
      client.leave(data.channel);
      this.logger.log(`Client ${client.id} unsubscribed from channel: ${data.channel}`);
      return { success: true, channel: data.channel };
    }
    this.logger.warn(`Client ${client.id} failed to unsubscribe: Channel required`);
    return { success: false, message: 'Channel required' };
  }

  sendToUser(userId: string, event: string, data: any) {
    this.logger.log(`Sending ${event} to user ${userId}`);
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToRole(role: string, event: string, data: any) {
    this.logger.log(`Sending ${event} to role ${role}`);
    this.server.to(`role:${role}`).emit(event, data);
  }

  broadcastEmergency(emergencyData: any) {
    this.logger.log('Broadcasting emergency alert');
    this.server
      .to('role:EMERGENCY_CENTER')
      .to('role:HOSPITAL')
      .to('role:RESCUE_TEAM')
      .emit('emergency', emergencyData);
  }

  emitStatusUpdate(data: any) {
    this.logger.log(`Emitting statusUpdate: ${JSON.stringify(data)}`);
    this.server
      .to('role:EMERGENCY_CENTER')
      .to('role:HOSPITAL')
      .to('role:RESCUE_TEAM')
      .emit('statusUpdate', data);
  }

  emitNotification(data: any) {
    this.logger.log(`Emitting notification: ${JSON.stringify(data)}`);
    this.server.to('role:EMERGENCY_CENTER').emit('notification', data);
  }
}