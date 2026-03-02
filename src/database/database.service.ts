import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
      console.log('Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async testDb() {
    return await this.$queryRaw`SELECT 1`;
  }
}