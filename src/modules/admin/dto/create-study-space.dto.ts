import { IsString, IsNotEmpty, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StudySpaceStatus } from '@prisma/client';


export class CreateStudySpaceDto {
  @ApiProperty({ example: 'Central Library' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Block A, Floor 2' })
  @IsString() @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 50 })
  @IsInt() @Min(1)
  total_capacity: number;

  @ApiProperty({ example: 45 })
  @IsInt() @Min(0)
  available_slots: number;

  @ApiProperty({ enum: StudySpaceStatus, example: 'open' })
  @IsEnum(StudySpaceStatus)
  status: StudySpaceStatus;

  @ApiProperty({ example: '08:00' })
  @IsString() @IsNotEmpty()
  opening_time: string;

  @ApiProperty({ example: '22:00' })
  @IsString() @IsNotEmpty()
  closing_time: string;
}