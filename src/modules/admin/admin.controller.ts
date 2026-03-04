import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';

import { Roles } from '@/common/decorators/roles.decorator';

import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Admin Dashboard')
@Controller('admin')
@Roles('superadmin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // login
  @Public()
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
}