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
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private userSocketMap: Map<string, string[]> = new Map();

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  // Notification gateway methods will be implemented here
  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || 
                    client.handshake.headers.authorization?.split(' ')[1];
                    
      if (!token) {
        client.disconnect();
        return;
      }
      
      // Validate token
      const payload = await this.authService.validateToken(token);
      
      if (!payload) {
        client.disconnect();
        return;
      }
      
      // Store user's socket connection
      const userId = payload.sub;
      const userSockets = this.userSocketMap.get(userId) || [];
      userSockets.push(client.id);
      this.userSocketMap.set(userId, userSockets);
      
      // Join user to their room
      client.join(`user:${userId}`);
      
      // Join role-based rooms (for broadcasts to roles)
      if (payload.role) {
        client.join(`role:${payload.role}`);
      }
      
      console.log(`Client connected: ${client.id} for user ${userId}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove socket from user's socket list
    for (const [userId, sockets] of this.userSocketMap.entries()) {
      const index = sockets.indexOf(client.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSocketMap.delete(userId);
        } else {
          this.userSocketMap.set(userId, sockets);
        }
        console.log(`Client disconnected: ${client.id} for user ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ) {
    // Subscribe client to additional channels
    if (data.channel) {
      client.join(data.channel);
      return { success: true, channel: data.channel };
    }
    return { success: false, message: 'Channel required' };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ) {
    // Unsubscribe client from channels
    if (data.channel) {
      client.leave(data.channel);
      return { success: true, channel: data.channel };
    }
    return { success: false, message: 'Channel required' };
  }

  // Method to send notification to a specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Method to send notification to users with a specific role
  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  // Method to broadcast emergency alerts
  broadcastEmergency(emergencyData: any) {
    this.server.to('role:EMERGENCY_CENTER').to('role:HOSPITAL').to('role:RESCUE_TEAM').emit('emergency', emergencyData);
  }
}