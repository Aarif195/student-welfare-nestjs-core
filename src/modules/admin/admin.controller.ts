import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';

import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';

import { Public } from '@/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Dashboard')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // login
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: AdminLoginDto })
  @ApiOkResponse({
    description: 'Login successful',
    type: AdminResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ErrorResponseDto
  })
  async login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  // logout
  @Post('logout')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin logout' })
  @ApiOkResponse({
    description: 'Logout successful',
    type: MessageResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async logout() {
    return this.adminService.logout();
  }

}