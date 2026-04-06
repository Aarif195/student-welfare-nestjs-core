import { IsString, IsNotEmpty, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StudySpaceStatus } from '@prisma/client';


export class CreateStudySpaceDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  location: string;

  @IsInt() @Min(1)
  total_capacity: number;

  @IsInt() @Min(0)
  available_slots: number;

  @IsEnum(StudySpaceStatus)
  status: StudySpaceStatus;

  @IsString() @IsNotEmpty()
  @ApiProperty({ example: '08:00' })
  opening_time: string;

  @IsString() @IsNotEmpty()
  @ApiProperty({ example: '22:00' })
  closing_time: string;
}