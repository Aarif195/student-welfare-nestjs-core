import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

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
}