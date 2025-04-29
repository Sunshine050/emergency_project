import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { EmergencyGrade, EmergencyType } from '../src/sos/dto/sos.dto';

let app: INestApplication;
let socket: Socket;

before(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.listen(3000);
});

after(async () => {
  await app.close();
});

beforeEach(async () => {
  socket = io('http://localhost:3000/notifications', {
    auth: {
      token: 'test-token',
    },
  });
  await new Promise<void>((resolve) => socket.on('connect', resolve));
});

afterEach(() => {
  if (socket.connected) {
    socket.disconnect();
  }
});

test('should receive emergency notification', (t, done) => {
  socket.on('emergency', (data) => {
    try {
      assert.ok(data.id);
      assert.strictEqual(data.type, EmergencyType.ACCIDENT);
      assert.strictEqual(data.grade, EmergencyGrade.URGENT);
      done();
    } catch (err) {
      done(err as Error);
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

test('should receive status updates', (t, done) => {
  socket.on('status-update', (data) => {
    try {
      assert.ok(data.emergencyId);
      assert.ok(data.status);
      done();
    } catch (err) {
      done(err as Error);
    }
  });

  socket.emit('updateStatus', {
    emergencyId: 'test-emergency-id',
    status: 'IN_PROGRESS',
  });
});
