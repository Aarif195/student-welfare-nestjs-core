import { IsString, IsNotEmpty, IsInt, IsNumber, Min, IsPositive, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// modules/hostel/dto/create-room.dto.ts
export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  readonly room_number: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly capacity: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  readonly price: number;

  @ApiProperty({ type: [CreateRoomResourceDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomResourceDto)
  readonly resources?: CreateRoomResourceDto[];
}