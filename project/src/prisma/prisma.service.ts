import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to clean up database during testing
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'production') {
      // Add tables in order that respects foreign key constraints
      const tables = [
        'notifications',
        'emergency_responses',
        'emergency_requests',
        'users',
        'organizations',
      ];

      // Use transaction to ensure all operations complete or fail together
      await this.$transaction(
        tables.map((table) => this.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`)),
      );
    }
  }
}