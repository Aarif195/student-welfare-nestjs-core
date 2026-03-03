import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ 
    example: false, 
    description: 'Indicates if the request was successful' 
  })
  success: boolean;

  @ApiProperty({ 
    example: 'Error message description', 
    description: 'The error message returned by the server' 
  })
  message: string;

  @ApiProperty({ 
    example: 400, 
    description: 'The HTTP status code (e.g., 400, 401, 403, 500)' 
  })
  statusCode: number;
}