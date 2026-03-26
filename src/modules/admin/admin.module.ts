import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../../database/database.module';
import { MailModule } from '@/providers/mail/mail.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: {
          expiresIn: config.get('jwt.expiresIn')
        }
      }),
    }),
    MailModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule { }