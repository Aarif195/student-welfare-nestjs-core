import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './google-login.dto';

export class RegisterDto {
  @IsNotEmpty({ message: 'First name is required' })
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email' })
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
    message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @ApiProperty({ example: 'P@ssw0rd' })
  password: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(/^\+?\d{7,15}$/, { message: 'Phone must be a valid number' })
  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'student', enum: ['student', 'owner'] })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.STUDENT;
}