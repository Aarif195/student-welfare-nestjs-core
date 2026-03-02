import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @IsNotEmpty({ message: 'OTP code is required' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @ApiProperty({ example: '123456' })
  otp_code: string;
}