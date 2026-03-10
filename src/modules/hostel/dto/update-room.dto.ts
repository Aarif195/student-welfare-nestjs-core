import { IsString, IsInt, IsNumber, Min, IsPositive, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoomDto {
  @ApiProperty({ example: 'Room 101', required: false })
  @IsString()
  @IsOptional()
  readonly room_number?: string;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly capacity?: number;

  @ApiProperty({ example: 50000, required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  readonly price?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  readonly availability?: boolean;
}