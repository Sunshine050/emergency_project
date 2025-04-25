import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { EmergencyGrade, EmergencyType } from '../src/sos/dto/sos.dto';

describe('WebSocket Gateway (e2e)', () => {
  let app: INestApplication;
  let socket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach((done) => {
    socket = io('http://localhost:3000/notifications', {
      auth: {
        token: 'test-token', // Replace with actual token in real tests
      },
    });
    socket.on('connect', done);
  });

  afterEach(() => {
    if (socket.connected) {
      socket.disconnect();
    }
  });

  it('should receive emergency notification', (done) => {
    socket.on('emergency', (data) => {
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('type', EmergencyType.ACCIDENT);
      expect(data).toHaveProperty('grade', EmergencyGrade.URGENT);
      done();
    });

    // Simulate emergency creation
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

  it('should receive status updates', (done) => {
    socket.on('status-update', (data) => {
      expect(data).toHaveProperty('emergencyId');
      expect(data).toHaveProperty('status');
      done();
    });

    // Simulate status update
    socket.emit('updateStatus', {
      emergencyId: 'test-emergency-id',
      status: 'IN_PROGRESS',
    });
  });
});