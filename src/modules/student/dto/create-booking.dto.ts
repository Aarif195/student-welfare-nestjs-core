import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  readonly room_id: number;

  @ApiProperty({ example: 'REF-12345' })
  @IsString()
  @IsNotEmpty()
  readonly reference: string;
}