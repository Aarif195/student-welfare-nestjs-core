import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RejectHostelDto {
    @ApiProperty({ example: 'Incomplete documentation' })
    @IsString()
    @IsOptional()
    reason?: string;
}