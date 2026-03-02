import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
  controllers: [CloudinaryController],
})
export class CloudinaryModule {}
