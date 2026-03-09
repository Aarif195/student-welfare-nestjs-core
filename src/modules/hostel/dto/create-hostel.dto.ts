import { IsString, IsNotEmpty, IsOptional, MinLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateHostelResourceDto } from './create-hostel-resource.dto';

export class CreateHostelDto {
  @ApiProperty({ example: 'Indigo Hostel' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Campus Road, Ibadan' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'A serene environment for students with 24/7 power.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ type: [CreateHostelResourceDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHostelResourceDto)
  resources?: CreateHostelResourceDto[];
}