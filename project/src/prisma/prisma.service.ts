import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
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
      console.error('PrismaService - Error connecting to database:', error instanceof Error ? error.message : 'Unknown error');
      throw error; // Re-throw เพื่อให้ NestJS จัดการ error ต่อ
    }
  }

  async onModuleDestroy() {
    try {
      console.log('PrismaService - Disconnecting from database...');
      await this.$disconnect();
      console.log('PrismaService - Database disconnected successfully');
    } catch (error) {
      console.error('PrismaService - Error disconnecting from database:', error instanceof Error ? error.message : 'Unknown error');
      throw error; // Re-throw เพื่อให้ NestJS จัดการ error ต่อ
    }
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      console.warn('PrismaService - Skipping database cleanup in production environment');
      return;
    }

    try {
      console.log('PrismaService - Cleaning database...');
      await this.$transaction([
        this.notification.deleteMany(), // ใช้ชื่อ model จาก Prisma schema (camelCase)
        this.emergencyResponse.deleteMany(),
        this.emergencyRequest.deleteMany(),
        this.user.deleteMany(),
        this.organization.deleteMany(),
        // เพิ่มตารางอื่น ๆ ตาม schema ของคุณ
      ]);
      console.log('PrismaService - Database cleaned successfully');
    } catch (error) {
      console.error('PrismaService - Error cleaning database:', error instanceof Error ? error.message : 'Unknown error');
      throw error; // Re-throw เพื่อให้ e2e test รู้ว่าเกิด error
    }
  }
}