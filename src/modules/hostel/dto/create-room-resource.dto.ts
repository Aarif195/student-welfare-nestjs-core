import { IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '@prisma/client';

export class CreateRoomResourceDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  @IsUrl()
  @IsNotEmpty()
  file_url: string;

  @ApiProperty({ enum: ResourceType, example: ResourceType.IMAGE })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  file_type: ResourceType;
}