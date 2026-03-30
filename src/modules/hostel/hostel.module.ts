import { Module } from '@nestjs/common';
import { HostelController } from './hostel.controller';
import { HostelService } from './hostel.service';
import { MailModule } from '@/providers/mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [HostelController],
  providers: [HostelService]
})
export class HostelModule {}
