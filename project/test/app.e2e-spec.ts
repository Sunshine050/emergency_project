import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EmergencyGrade, EmergencyType } from '../src/sos/dto/sos.dto';

let app: INestApplication;
let prismaService: PrismaService;
let authToken: string;

before(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  prismaService = app.get<PrismaService>(PrismaService);
  await app.init();

  // Clean up the database before tests
  await prismaService.cleanDatabase();
});

after(async () => {
  await prismaService.cleanDatabase();
  await app.close();
});

test('should authenticate user and return JWT token', async () => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: 'test@example.com',
      password: 'testpassword',
    })
    .expect(200);

  assert.ok(response.body.access_token, 'Response should have access_token');
  authToken = response.body.access_token;
});

test('should create emergency request and notify responders', async () => {
  assert.ok(authToken, 'Auth token should be defined');

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

  assert.ok(emergencyResponse.body.id, 'Emergency response should have an id');
  const emergencyId = emergencyResponse.body.id;

  const statusResponse = await request(app.getHttpServer())
    .get('/dashboard/active-emergencies')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);

  assert.ok(
    statusResponse.body.some((item: any) => item.id === emergencyId),
    'Active emergencies should contain the created emergency',
  );
});