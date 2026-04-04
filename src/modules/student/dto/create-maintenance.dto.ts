import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'Broken AC' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The AC in my room is making a loud noise and not cooling.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false, example: 'https://cloudinary.com/image.jpg' })
  @IsUrl()
  @IsOptional()
  image_url?: string;
}