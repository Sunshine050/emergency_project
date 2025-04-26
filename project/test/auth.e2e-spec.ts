import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Authentication (e2e)", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prismaService.cleanDatabase();
    await app.close();
  });

  describe("OAuth Flow", () => {
    it("/auth/login (POST) - should initiate OAuth login", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({ provider: "google" })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("url");
          expect(res.body.url).toContain("google");
        });
    });

    it("/auth/login (POST) - should reject invalid provider", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({ provider: "invalid" })
        .expect(400);
    });

    it("/auth/callback/google (POST) - should handle invalid callback code", () => {
      return request(app.getHttpServer())
        .post("/auth/callback/google")
        .send({ code: "invalid-code" })
        .expect(401);
    });
  });

  describe("Protected Routes", () => {
    it("/auth/me (GET) - should require authentication", () => {
      return request(app.getHttpServer()).get("/auth/me").expect(401);
    });

    it("/auth/refresh (POST) - should reject invalid refresh token", () => {
      return request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(401);
    });
  });
});
