import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { EmergencyGrade, EmergencyType } from '../src/sos/dto/sos.dto';
import { ConfigService } from '@nestjs/config';

let app: INestApplication;
let socket: Socket;
let port: number;

before(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  const configService = app.get(ConfigService);
  port = configService.get('PORT') || 3000; // ใช้พอร์ตจาก environment หรือ default เป็น 3000
  await app.listen(port);
});

after(async () => {
  if (app) {
    await app.close();
  }
});

beforeEach(async () => {
  socket = io(`http://localhost:${port}/notifications`, {
    auth: {
      token: 'test-token', // ควร mock token หรือรับจาก endpoint login
    },
  });
  await new Promise<void>((resolve) => socket.on('connect', () => resolve()));
});

afterEach(() => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
});

test('should receive emergency notification', async () => {
  await new Promise<void>((resolve, reject) => {
    socket.on('emergency', (data) => {
      try {
        assert.ok(data.id, 'Emergency should have an ID');
        assert.strictEqual(data.type, EmergencyType.ACCIDENT, 'Type should be ACCIDENT');
        assert.strictEqual(data.grade, EmergencyGrade.URGENT, 'Grade should be URGENT');
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    socket.emit('createEmergency', {
      type: EmergencyType.ACCIDENT,
      grade: EmergencyGrade.URGENT,
      location: 'Test Location',
      coordinates: {
        latitude: 13.7563,
        longitude: 100.5018,
      },
    });
  });
});

test('should receive status updates', async () => {
  await new Promise<void>((resolve, reject) => {
    socket.on('status-update', (data) => {
      try {
        assert.ok(data.emergencyId, 'Should have emergencyId');
        assert.ok(data.status, 'Should have status');
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    socket.emit('updateStatus', {
      emergencyId: 'test-emergency-id',
      status: 'IN_PROGRESS',
    });
  });
});