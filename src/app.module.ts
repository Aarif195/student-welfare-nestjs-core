import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './providers/cloudinary/cloudinary.module';

import { ThrottlerModule } from '@nestjs/throttler';

import { envConfig } from './common/config/env.config';

import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { MailModule } from './providers/mail/mail.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CustomThrottlerGuard } from './common/guards/throttler-proxy.guard';
import { HostelModule } from './modules/hostel/hostel.module';
import { StudentModule } from './modules/student/student.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10, // 10 requests per minute
    }]),
    DatabaseModule,
    AuthModule,
    CloudinaryModule,
    MailModule,
    AdminModule,
    ProfileModule,
    HostelModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
  ],
})
export class AppModule { }
