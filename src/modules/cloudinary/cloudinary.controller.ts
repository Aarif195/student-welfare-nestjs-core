import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Cloudinary')
@Controller('cloudinary')
@UseGuards(AuthGuard)
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Get('signature')
    @ApiOperation({ summary: 'Generate Cloudinary upload signature' })
    @ApiBearerAuth()
    @ApiQuery({ name: 'folder', required: false, description: 'Cloudinary folder', example: 'avatars' })
    @ApiResponse({
        status: 200, description: 'Returns upload signature and configuration', schema: {
            example: {
                signature: 'abc123def456...',
                timestamp: 1715432100,
                cloudName: 'your-cloud-name',
                apiKey: '1234567890'
            }
        }
    })
    getSignature(@Query('folder') folder?: string) {
        return this.cloudinaryService.generateSignature(folder || 'general');
    }
}
