import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiUnauthorizedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('me')
  @Roles(Role.student, Role.hostelOwner, Role.superadmin)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: 'Profile retrieved successfully',
    type: UserProfileResponseDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  getProfile(@GetUser() user: any) {
    return this.profileService.getProfile(user.id, user.role);
  }

  @Patch('update')
  @Roles(Role.student, Role.hostelOwner, Role.superadmin)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: UserProfileResponseDto
  })
  @ApiBadRequestResponse({ description: 'Bad Request - Validation failed', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  updateProfile(
    @GetUser('id') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }
}