import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OwnerNotificationDto {
  @ApiProperty({ example: 'Hostel Meeting' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'General meeting by 7 PM in the common room.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}