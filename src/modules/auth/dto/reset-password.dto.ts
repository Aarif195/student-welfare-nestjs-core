import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Valid email is required' })
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @ApiProperty({ example: '123456' })
  otp_code: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
    message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @ApiProperty({ example: 'NewP@ssw0rd123' })
  newPassword: string;
}