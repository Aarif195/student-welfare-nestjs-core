import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  STUDENT = 'student',
  OWNER = 'hostelOwner',
}

export class GoogleLoginDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIs...', description: 'Google ID Token' })
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '08012345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}