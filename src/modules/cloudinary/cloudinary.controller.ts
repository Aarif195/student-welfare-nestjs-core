import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CloudinarySignatureResponseDto } from './dto/cloudinary-signature-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';

@ApiTags('Cloudinary')
@Controller('cloudinary')
@UseGuards(AuthGuard)
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Get('signature')
    @ApiOperation({ summary: 'Generate Cloudinary upload signature' })
    @ApiBearerAuth()
    @ApiQuery({ name: 'folder', required: false, description: 'Cloudinary folder', example: 'avatars' })
    @ApiOkResponse({
        description: 'Returns upload signature and configuration',
        type: CloudinarySignatureResponseDto
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized access',
        type: ErrorResponseDto
    })
    getSignature(@Query('folder') folder?: string) {
        return this.cloudinaryService.generateSignature(folder || 'general');
    }
}
