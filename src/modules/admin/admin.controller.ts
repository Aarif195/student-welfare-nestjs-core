import { Body, Controller, Post, HttpCode, HttpStatus, Query, Get, ParseIntPipe, Param, BadRequestException, Patch, Request, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBearerAuth, ApiBadRequestResponse, ApiQuery, ApiParam, ApiCreatedResponse } from '@nestjs/swagger';
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
import { AdminNotificationDto } from './dto/create-notification.dto';
import { UpdateMaintenanceStatusDto } from '../hostel/dto/update-maintenance-status.dto';
import { ReplyReviewDto } from '../hostel/dto/reply-review.dto';
import { CreateStudySpaceDto } from './dto/create-study-space.dto';
import { UpdateStudySpaceDto } from './dto/update-study-space.dto';

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

  // getAllOwners
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('owners')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all hostel owners' })
  @ApiOkResponse({ description: 'Owners retrieved successfully' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllOwners(@Query() paginationDto: PaginationDto) {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;

    const data = await this.adminService.getAllOwners(page, limit);

    return {
      success: true,
      page,
      limit,
      total: data.total,
      HostelOwners: data.owners,
    };
  }

  // getAllStudents
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('students')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all students' })
  @ApiOkResponse({ description: 'Students retrieved successfully' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllStudents(@Query() paginationDto: PaginationDto) {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;

    const data = await this.adminService.getAllStudents(page, limit);

    return {
      success: true,
      page,
      limit,
      total: data.total,
      students: data.students,
    };
  }

  // createNotification
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('notifications')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create global or hostel-specific notification' })
  @ApiOkResponse({ description: 'Notification created and sent' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async createNotification(
    @Request() req: any,
    @Body() dto: AdminNotificationDto,
  ) {
    const adminId = req.user.id;
    const data = await this.adminService.createNotification(adminId, dto);

    return {
      success: true,
      message: 'Notification successfully published and sent to students',
      data,
    };
  }

  // getAllNotifications
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('notifications')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiOkResponse({ description: 'Notifications retrieved successfully' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllNotifications(@Query() paginationDto: PaginationDto) {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;

    const data = await this.adminService.getAllNotifications(page, limit);

    return {
      success: true,
      page,
      limit,
      total: data.total,
      notifications: data.notifications,
    };
  }

  // deleteNotification
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Delete('notifications/:notificationId')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete any notification' })
  @ApiParam({ name: 'notificationId', type: Number })
  @ApiOkResponse({ description: 'Notification deleted successfully' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async deleteNotification(@Param('notificationId', ParseIntPipe) notificationId: number) {
    await this.adminService.deleteNotification(notificationId);
    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  }

  // getAllMaintenance
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('maintenance')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Superadmin views all maintenance requests' })
  @ApiOkResponse({ description: 'All maintenance requests retrieved successfully' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiQuery({ name: 'hostelId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllMaintenance(
    @Query() pagination: PaginationDto,
    @Query('hostelId') hostelId?: number,
  ) {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;

    const { total, requests } = await this.adminService.getAllMaintenance(page, limit, hostelId);

    return {
      success: true,
      meta: { page, limit, total },
      MaintenanceRequests: requests,
    };
  }

  // updateMaintenanceStatus
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch('maintenance/:id/status')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Superadmin to updates any maintenance request status' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async updateMaintenanceStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaintenanceStatusDto,
  ) {
    await this.adminService.updateMaintenanceStatus(id, dto.status);
    return { success: true, message: `Maintenance status updated to ${dto.status} by admin` };
  }


  // getAllReviews
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('reviews')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Superadmin views all reviews' })
  @ApiOkResponse({ description: 'All reviews retrieved successfully' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiQuery({ name: 'hostelId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllReviews(
    @Query() pagination: PaginationDto,
    @Query('hostelId') hostelId?: number,
  ) {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;

    const { reviews, total } = await this.adminService.getAllReviews(page, limit, hostelId);

    return {
      success: true,
      meta: { page, limit, total },
      reviews,
    };
  }

  // adminReplyToReview
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('reviews/:reviewId/reply')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin replies to a review' })
  @ApiParam({ name: 'reviewId', type: Number })
  @ApiBody({ type: ReplyReviewDto })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async adminReplyToReview(
    @Request() req: any,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: ReplyReviewDto,
  ) {
    const adminId = req.user.id;
    await this.adminService.adminReplyToReview(reviewId, dto);
    return { success: true, message: 'Review replied to successfully' };
  }


  // createStudySpace
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('study-spaces')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new study space' })
  @ApiCreatedResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async createStudySpace(
    @Request() req: any,
    @Body() dto: CreateStudySpaceDto,
  ) {
    const adminId = req.user.id;
    const data = await this.adminService.createStudySpace(adminId, dto);

    return {
      success: true,
      message: 'Study space created successfully',
      data,
    };
  }
  

  // updateStudySpace
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Patch('study-spaces/:id')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a study space' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateStudySpaceDto })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async updateStudySpace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudySpaceDto,
  ) {
    const data = await this.adminService.updateStudySpace(id, dto);
    return {
      success: true,
      message: 'Study space updated successfully',
      data,
    };
  }

  // deleteStudySpace
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Delete('study-spaces/:id')
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a study space' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async deleteStudySpace(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteStudySpace(id);
    return { success: true, message: 'Study space deleted successfully' };
  }

  
}