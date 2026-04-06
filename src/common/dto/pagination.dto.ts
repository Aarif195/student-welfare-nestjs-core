import { StudySpaceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly page: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly limit: number;

  @IsOptional()
  @IsEnum(StudySpaceStatus)
  status?: StudySpaceStatus;
}