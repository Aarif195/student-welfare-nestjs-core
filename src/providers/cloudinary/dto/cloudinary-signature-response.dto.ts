import { ApiProperty } from '@nestjs/swagger';

export class CloudinarySignatureResponseDto {
  @ApiProperty({ example: 'abc123def456...' })
  signature: string;

  @ApiProperty({ example: 1715432100 })
  timestamp: number;

  @ApiProperty({ example: 'your-cloud-name' })
  cloudName: string;

  @ApiProperty({ example: '1234567890' })
  apiKey: string;

  @ApiProperty({ example: 'avatars' })
  folder: string;
}