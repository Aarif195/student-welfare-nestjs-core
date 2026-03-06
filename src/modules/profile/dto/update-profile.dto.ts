import { IsOptional, IsString, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @ApiProperty({ example: 'John', required: false })
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @ApiProperty({ example: 'Doe', required: false })
  lastName?: string;

  @IsOptional()
  @Matches(/^\+?\d{7,15}$/, { message: 'Phone must be a valid number' })
  @ApiProperty({ example: '+1234567890', required: false })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  image?: string;


  @IsOptional()
  @IsString()
  @ApiProperty({ example: '123 Main St', required: false })
  address?: string;
}