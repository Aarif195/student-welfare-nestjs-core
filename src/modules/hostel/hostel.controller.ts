import { Controller, Post, Body, Patch, Param, ParseIntPipe, Get, Query, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiQuery, ApiNoContentResponse, ApiParam } from '@nestjs/swagger';

import { Role } from '@prisma/client';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';

import { HostelService } from './hostel.service';

import { UpdateHostelDto } from './dto/update-hostel.dto';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { OwnerNotificationDto } from './dto/create-notification.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('hostels')
@ApiTags('Hostels')
@ApiBearerAuth()
export class HostelController {
    constructor(private readonly hostelService: HostelService) { }

    @Post()
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Create a new hostel' })
    @ApiCreatedResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    create(
        @Body() createHostelDto: CreateHostelDto,
        @GetUser() user: { id: number; role: string }
    ) {
        return this.hostelService.createHostel(user.id, createHostelDto);
    }

    // updateHostel
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Patch(':id')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Update hostel details' })
    @ApiOkResponse({ type: MessageResponseDto })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateHostelDto: UpdateHostelDto,
        @GetUser() user: { id: number; role: string },
    ) {
        return this.hostelService.updateHostel(id, user.id, updateHostelDto);
    }

    // getMyHostels
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get('my-hostels')
    @Roles(Role.hostelOwner)
    @ApiOkResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getMyHostels(
        @GetUser() user: { id: number },
        @Query() pagination: PaginationDto,
    ) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        return this.hostelService.getMyHostels(user.id, page, limit);
    }

    // getSingleHostel
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get(':id')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Get a single hostel by ID' })
    @ApiOkResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto }) getOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: { id: number },
    ) {
        return this.hostelService.getOne(id, user.id);
    }

    // deleteHostel
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Delete(':id')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Delete a hostel' })
    @ApiNoContentResponse({ description: 'Hostel deleted successfully' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    deleteHostel(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: { id: number },
    ) {
        return this.hostelService.deleteHostel(id, user.id);
    }


    // createRoom
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post(':hostelId/rooms')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Create a new room' })
    @ApiCreatedResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    createRoom(
        @Param('hostelId', ParseIntPipe) hostelId: number,
        @Body() createRoomDto: CreateRoomDto,
        @GetUser() user: { id: number }
    ) {
        return this.hostelService.createRoom(hostelId, user.id, createRoomDto);
    }

    // getRoomsByHostel
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get(':hostelId/rooms')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Get all rooms in a hostel' })
    @ApiOkResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getRoomsByHostel(
        @Param('hostelId', ParseIntPipe) hostelId: number,
        @GetUser() user: { id: number },
        @Query() pagination: PaginationDto,
    ) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        return this.hostelService.getRoomsByHostel(hostelId, user.id, page, limit);
    }

    // getSingleRoom
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get(':hostelId/rooms/:roomId')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Get single room details' })
    @ApiOkResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    getSingleRoom(
        @Param('hostelId', ParseIntPipe) hostelId: number,
        @Param('roomId', ParseIntPipe) roomId: number,
        @GetUser() user: { id: number },
    ) {
        return this.hostelService.getSingleRoom(hostelId, roomId, user.id);
    }

    // updateRoom
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Patch(':hostelId/rooms/:roomId')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Update room details' })
    @ApiOkResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    updateRoom(
        @Param('hostelId', ParseIntPipe) hostelId: number,
        @Param('roomId', ParseIntPipe) roomId: number,
        @GetUser() user: { id: number },
        @Body() updateRoomDto: UpdateRoomDto,
    ) {
        return this.hostelService.updateRoom(hostelId, roomId, user.id, updateRoomDto);
    }

    // deleteRoom
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Delete(':hostelId/rooms/:roomId')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Delete a room' })
    @ApiNoContentResponse({ description: 'Room deleted' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    deleteRoom(
        @Param('hostelId', ParseIntPipe) hostelId: number,
        @Param('roomId', ParseIntPipe) roomId: number,
        @GetUser() user: { id: number },
    ) {
        return this.hostelService.deleteRoom(hostelId, roomId, user.id);
    }


    // getOwnerBookings
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get('bookings')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Get all bookings for all hostels owned by the user' })
    @ApiOkResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getOwnerBookings(
        @GetUser() user: { id: number },
        @Query() pagination: PaginationDto,
    ) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        return this.hostelService.getOwnerBookings(user.id, page, limit);
    }

    // createHostelNotification
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post(':hostelId/notifications')
    @Roles(Role.hostelOwner)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create notification for a specific owned hostel' })
    @ApiOkResponse({ description: 'Hostel notification created and sent' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiParam({ name: 'hostelId', type: Number })
    async createNotification(
        @Request() req: any,
        @Param('hostelId', ParseIntPipe) hostelId: number,
        @Body() dto: OwnerNotificationDto,
    ) {
        const ownerId = req.user.id;
        const data = await this.hostelService.createHostelNotification(ownerId, hostelId, dto);

        return {
            success: true,
            message: 'Notification successfully published to your hostel residents',
            data,
        };
    }

    // getHostelNotifications
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get(':hostelId/notifications')
    @Roles(Role.hostelOwner)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all notifications for a specific owned hostel' })
    @ApiOkResponse({ description: 'Hostel notifications retrieved successfully' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiParam({ name: 'hostelId', type: Number })
    async getHostelNotifications(@Request() req: any, @Param('hostelId', ParseIntPipe) hostelId: number) {
        const ownerId = req.user.id;
        const notifications = await this.hostelService.getHostelNotifications(ownerId, hostelId);
        return {
            success: true,
            data: notifications,
        };
    }

    // deleteNotification
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Delete('notifications/:notificationId')
    @Roles(Role.hostelOwner)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a notification' })
    @ApiParam({ name: 'notificationId', type: Number })
    @ApiOkResponse({ description: 'Notification deleted successfully' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    async deleteNotification(@Request() req: any, @Param('notificationId', ParseIntPipe) notificationId: number) {
        const ownerId = req.user.id;
        await this.hostelService.deleteHostelNotification(ownerId, notificationId);
        return {
            success: true,
            message: 'Notification deleted successfully',
        };
    }

    // getHostelMaintenance
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get('maintenance/:hostelId')
    @Roles(Role.hostelOwner)
    @ApiOperation({ summary: 'Owner views maintenance requests for a specific hostel' })
    @ApiOkResponse({ description: 'Hostel maintenance requests retrieved successfully', type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getHostelMaintenance(
        @GetUser() user: { id: number },
        @Param('hostelId', ParseIntPipe) hostelId: number,
        @Query() pagination: PaginationDto
    ) {
        const page = Number(pagination.page) || 1;
        const limit = Number(pagination.limit) || 10;

        const { total, requests } = await this.hostelService.getHostelMaintenance(user.id, hostelId, page, limit);

        return {
            success: true,
            meta: { page, limit, total },
            MaintenanceRequests: requests,
        };
    }


    

}