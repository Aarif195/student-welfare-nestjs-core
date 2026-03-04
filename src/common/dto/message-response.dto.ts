import { ApiProperty } from "@nestjs/swagger";

export class MessageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ example: null })
  data: any;

  
}