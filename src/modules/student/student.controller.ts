import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { StudentService } from './student.service';

import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Throttle } from '@nestjs/throttler';

@ApiBearerAuth()
@Controller('student')
export class StudentController {
    constructor(private studentService: StudentService) { }

    // bookRoom
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('bookings')
    @Roles(Role.student)
    @ApiOperation({ summary: 'Book a room' })
    @ApiCreatedResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    bookRoom(
        @GetUser() user: { id: number; role: string },
        @Body() createBookingDto: CreateBookingDto,

    ) {
        console.log(user)
        return this.studentService.bookRoom(user.id, createBookingDto);
    }

    // getMyBookings
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get('bookings')
    @Roles(Role.student)
    @ApiOperation({ summary: 'Get my bookings' })
    @ApiOkResponse({ description: 'Bookings retrieved successfully' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getMyBookings(
        @GetUser() user: { id: number },
        @Query() pagination: PaginationDto,
    ) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        return this.studentService.getMyBookings(user.id, page, limit);
    }

    // cancelBooking
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Patch('bookings/:bookingId/cancel')
    @Roles(Role.student)
    @ApiOperation({ summary: 'Cancel a pending booking' })
    @ApiOkResponse({ description: 'Booking cancelled successfully', type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    async cancelBooking(
        @GetUser() user: { id: number },
        @Param('bookingId', ParseIntPipe) bookingId: number,
    ) {
        try {
            const data = await this.studentService.cancelBooking(bookingId, user.id);
            return { success: true, message: 'Booking cancelled successfully', data };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // getAvailableHostels
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get('hostels')
    @Roles(Role.student)
    @ApiOperation({ summary: 'Get all available hostels' })
    @ApiOkResponse({ description: 'Hostels retrieved successfully' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getAvailableHostels(@Query() pagination: PaginationDto) {
        const page = Number(pagination.page) || 1;
        const limit = Number(pagination.limit) || 10;
        const { total, hostels } = await this.studentService.getAvailableHostels(page, limit);

        return {
            success: true,
            meta: { page, limit, total },
            AvailableHostels: hostels,
        };
    }

    // getAvailableRooms
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get('rooms')
    @Roles(Role.student)
    @ApiOperation({ summary: 'Get available rooms with filters' })
    @ApiOkResponse({ description: 'Rooms retrieved successfully' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiQuery({ name: 'hostel_id', required: false, type: Number })
    @ApiQuery({ name: 'price', required: false, type: Number })
    @ApiQuery({ name: 'capacity', required: false, type: Number })
    @ApiQuery({ name: 'sort', required: false, enum: ['price_asc', 'price_desc'] })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getAvailableRooms(@Query() query: any) {
        const { hostel_id, price, capacity, sort, page, limit } = query;
        const data = await this.studentService.getAvailableRooms(
            { hostel_id, price, capacity },
            Number(page) || 1,
            Number(limit) || 10,
            sort
        );

        return {
            success: true,
            meta: { page: Number(page) || 1, limit: Number(limit) || 10, total: data.total },
            AvailableRooms: data.rooms,
        };
    }

    // getMyNotifications
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get('notifications')
    @Roles(Role.student)
    @ApiOperation({ summary: 'Get my notifications' })
    @ApiOkResponse({ description: 'Notifications retrieved successfully' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getMyNotifications(@GetUser() user: { id: number }, @Query() pagination: PaginationDto,
    ) {
        const page = Number(pagination.page) || 1;
        const limit = Number(pagination.limit) || 10;
        const { total, notifications } =
            await this.studentService.getMyNotifications(user.id, page, limit);
       return {
    success: true,
    meta: { page, limit, total },
    notifications,
  };
    }

    // markAsRead
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Patch('notifications/:notificationId/read')
    @Roles(Role.student)
    @ApiOperation({ summary: 'Mark a notification as read' })
    @ApiOkResponse({ description: 'Notification marked as read successfully', type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    async markAsRead(
        @GetUser() user: { id: number },
        @Param('notificationId', ParseIntPipe) notificationId: number,
    ) {
        try {
            const data = await this.studentService.markAsRead(user.id, notificationId);
            return { success: true, message: 'Notification marked as read successfully', data };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

}
