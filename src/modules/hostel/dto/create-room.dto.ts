import { IsString, IsNotEmpty, IsInt, IsNumber, Min, IsPositive, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateRoomResourceDto } from './create-room-resource.dto';

// modules/hostel/dto/create-room.dto.ts
export class CreateRoomDto {
  @ApiProperty({ example: 'Room 101' })
  @IsString()
  @IsNotEmpty()
  readonly room_number: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly capacity: number;

  @ApiProperty({ example: 50000 })
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