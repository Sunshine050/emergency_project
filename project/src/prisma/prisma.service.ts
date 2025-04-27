import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });
    // Log DATABASE_URL เพื่อยืนยันการเชื่อมต่อ
    console.log('PrismaService - DATABASE_URL:', process.env.DATABASE_URL);
  }

  async onModuleInit() {
    try {
      console.log('PrismaService - Connecting to database...');
      await this.$connect();
      console.log('PrismaService - Database connected successfully');
    } catch (error) {
      console.error('PrismaService - Error connecting to database:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      console.log('PrismaService - Disconnecting from database...');
      await this.$disconnect();
      console.log('PrismaService - Database disconnected successfully');
    } catch (error) {
      console.error('PrismaService - Error disconnecting from database:', error.message);
    }
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV !== "production") {
      const tables = [
        "notifications",
        "emergency_responses",
        "emergency_requests",
        "users",
        "organizations",
      ];

      try {
        console.log('PrismaService - Cleaning database...');
        await this.$transaction(
          tables.map((table) =>
            this.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`),
          ),
        );
        console.log('PrismaService - Database cleaned successfully');
      } catch (error) {
        console.error('PrismaService - Error cleaning database:', error.message);
        throw error;
      }
    }
  }
}