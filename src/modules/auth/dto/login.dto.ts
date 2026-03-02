import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100, { message: 'Email is too long' })
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(50, { message: 'Password is too long' })
  @ApiProperty({ example: 'P@ssw0rd' })
  password: string;
}