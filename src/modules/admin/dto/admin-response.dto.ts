import { ApiProperty } from '@nestjs/swagger';

class AdminData {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin@hostel.com' })
  email: string;

  @ApiProperty({ example: 'superadmin' })
  role: string;
}

export class AdminResponseDto {
  @ApiProperty({ example: 'Admin login successful' })
  message: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1Ni...' })
  accessToken: string;

  @ApiProperty({ type: AdminData })
  admin: AdminData;
}