import { ApiProperty } from "@nestjs/swagger";

// src/common/dto/message-response.dto.ts
export class MessageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ example: null })
  data: any;

  
}