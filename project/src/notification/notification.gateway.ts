import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";

// กำหนด interface TokenPayload
interface TokenPayload {
  id: string;
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@WebSocketGateway({
  cors: {
    origin: "*", // In production, replace with actual frontend domain
    methods: ["GET", "POST"],
    credentials: true,
  },
  namespace: "/notifications",
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger("NotificationGateway");
  private userSocketMap: Map<string, Set<string>> = new Map();

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log("Notification WebSocket Gateway initialized");
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.disconnect(client);
        return;
      }

      const user = await this.validateToken(token);
      if (!user) {
        this.disconnect(client);
        return;
      }

      // Store socket connection
      this.storeUserSocket(user.id, client.id);

      // Join user-specific room
      client.join(`user:${user.id}`);

      // Join role-based room
      if (user.role) {
        client.join(`role:${user.role}`);
      }

      this.logger.log(`Client connected: ${client.id} for user ${user.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      this.disconnect(client);
    }
  }

  handleDisconnect(client: Socket) {
    this.removeUserSocket(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractToken(client: Socket): string | null {
    const auth =
      client.handshake.auth.token || client.handshake.headers.authorization;

    if (!auth) return null;

    return auth.replace("Bearer ", "");
  }

  private async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = await this.authService.validateToken(token);
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  private storeUserSocket(userId: string, socketId: string) {
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set());
    }
    this.userSocketMap.get(userId).add(socketId);
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

  private disconnect(client: Socket) {
    client.disconnect(true);
  }

  // Public methods for sending notifications
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  broadcastEmergency(data: any) {
    this.server
      .to("role:EMERGENCY_CENTER")
      .to("role:HOSPITAL")
      .to("role:RESCUE_TEAM")
      .emit("emergency", data);
  }

  broadcastStatusUpdate(data: any) {
    this.server.emit("status-update", data);
  }
}
