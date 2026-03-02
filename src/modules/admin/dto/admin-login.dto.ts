import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@hostel.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}