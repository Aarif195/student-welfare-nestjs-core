import { IsString, IsNotEmpty, IsInt, IsNumber, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

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
}