import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyReviewDto {
  @ApiProperty({ example: 'Thank you for your feedback.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reply: string;
}