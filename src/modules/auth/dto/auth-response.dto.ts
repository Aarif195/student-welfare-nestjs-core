import { ApiProperty } from '@nestjs/swagger';

class UserData {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'student' })
  role: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/path/to/image.jpg', nullable: true })
  image: string;

}

export class AuthResponseDto {
  @ApiProperty({ type: UserData })
  user: UserData;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1Ni...' })
  token: string;
}