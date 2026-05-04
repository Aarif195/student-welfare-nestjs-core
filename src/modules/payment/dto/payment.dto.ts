import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 500, description: 'Amount in dollars' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: '1', description: 'The ID of the room being booked' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ example: 'user@example.com', description: 'Student email' })
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class PaymentIntentResponseDto {
  @ApiProperty()
  clientSecret: string;

  @ApiProperty()
  id: string;
}