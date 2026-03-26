import { Body, Controller, Post, HttpCode, HttpStatus, Query, Get, ParseIntPipe, Param, BadRequestException, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBearerAuth, ApiBadRequestResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';

import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';


import { Public } from '@/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RejectHostelDto } from './dto/admin-rejectHostel.dto';

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
  @Throttle({ default: { limit: 3, ttl: 60000 } })
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


  // getAllHostels
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('hostels')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all hostels (Admin)' })
  @ApiOkResponse({ description: 'Hostels retrieved successfully' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllHostels(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const data = await this.adminService.getAllHostels(
      Number(page) || 1,
      Number(limit) || 10,
    );

    return {
      success: true,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      total: data.total,
      Hostels: data.hostels,
    };
  }

  // approveHostel
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Patch('approve/:hostelId')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a hostel' })
  @ApiParam({ name: 'hostelId', type: Number })
  @ApiOkResponse({ description: 'Hostel approved successfully', type: MessageResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async approveHostel(
    @Param('hostelId', ParseIntPipe) hostelId: number,
  ) {
    try {
      const data = await this.adminService.approveHostel(hostelId);
      return { success: true, message: 'Hostel approved successfully', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // rejectHostel
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Patch('reject/:hostelId')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a hostel' })
  @ApiParam({ name: 'hostelId', type: Number })
  @ApiBody({ type: RejectHostelDto })
  @ApiOkResponse({ description: 'Hostel rejected successfully', type: MessageResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async rejectHostel(
    @Param('hostelId', ParseIntPipe) hostelId: number,
    @Body() dto: RejectHostelDto,
  ) {
    try {
      const data = await this.adminService.rejectHostel(hostelId, dto);
      return { success: true, message: 'Hostel rejected successfully', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  // getPendingBookings
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('bookings')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending bookings (Admin)' })
  @ApiOkResponse({ description: 'Bookings retrieved successfully' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPendingBookings(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const data = await this.adminService.getPendingBookings(
      Number(page) || 1,
      Number(limit) || 10,
    );

    return {
      success: true,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      total: data.total,
      bookings: data.bookings,
    };
  }

  // approveBooking
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Patch('booking/approve/:bookingId')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a student booking' })
  @ApiParam({ name: 'bookingId', type: Number })
  @ApiOkResponse({ description: 'Booking approved and email sent' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async approveBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    await this.adminService.approveBooking(bookingId);
    return {
      success: true,
      message: 'Booking approved and email sent to student',
    };
  }

  // rejectBooking
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Patch('booking/reject/:bookingId')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a student booking' })
  @ApiParam({ name: 'bookingId', type: Number })
  @ApiBody({ type: RejectHostelDto })
  @ApiOkResponse({ description: 'Booking rejected and email sent' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async rejectBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body() dto: RejectHostelDto
  ) {
    if (!dto.reason) throw new BadRequestException('Rejection reason is required');
    
    await this.adminService.rejectBooking(bookingId, dto);
    return {
      success: true,
      message: 'Booking rejected and notification sent',
    };
  }

}