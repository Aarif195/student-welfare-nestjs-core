import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  GLOBAL = 'global',
  HOSTEL = 'hostel',
}

export class AdminNotificationDto {
  @ApiProperty({ example: 'Water Supply Maintenance' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'There will be no water from 2 PM to 5 PM.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  hostelId?: number;
}