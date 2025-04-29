import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EmergencyGrade, EmergencyType } from '../src/sos/dto/sos.dto';

describe('Emergency Response System (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up the database before tests
    await prismaService.cleanDatabase();
  });

  afterAll(async () => {
    await prismaService.cleanDatabase();
    await app.close();
  });

  describe('Authentication', () => {
    it('should authenticate user and return JWT token', async () => {
      // Mock authentication หรือใช้ข้อมูลผู้ใช้ที่สร้างไว้สำหรับทดสอบ
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com', // เปลี่ยนจาก provider เป็นข้อมูลที่เหมาะสม
          password: 'testpassword',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token'); // คาดหวัง token ไม่ใช่ url
      authToken = response.body.access_token; // เก็บ token
    });
  });

  describe('Emergency Flow', () => {
    it('should create emergency request and notify responders', async () => {
      // ตรวจสอบว่าได้ token มาก่อน
      expect(authToken).toBeDefined();

      // Create emergency request
      const emergencyResponse = await request(app.getHttpServer())
        .post('/sos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Car accident on main street',
          latitude: 13.7563,
          longitude: 100.5018,
          grade: EmergencyGrade.URGENT,
          type: EmergencyType.ACCIDENT,
          medicalInfo: {
            injuries: ['head trauma', 'broken arm'],
            consciousness: 'conscious',
          },
        })
        .expect(201);

      expect(emergencyResponse.body).toHaveProperty('id');
      const emergencyId = emergencyResponse.body.id;

      // Check emergency status
      const statusResponse = await request(app.getHttpServer())
        .get('/dashboard/active-emergencies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(statusResponse.body).toContainEqual(
        expect.objectContaining({
          id: emergencyId,
        }),
      );
    });
  });
});