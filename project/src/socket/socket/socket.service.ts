import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SocketService {
  private io: Server;

  constructor(private jwtService: JwtService) {}

  initialize(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          socket.data.user = payload;
          next();
        } catch (error) {
          next(new Error('Invalid token'));
        }
      } else {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  emitEmergency(data: any) {
    this.io.emit('emergency', data);
  }

  emitStatusUpdate(data: any) {
    this.io.emit('statusUpdate', data);
  }

  emitNotification(data: any) {
    this.io.emit('notification', data);
  }
}