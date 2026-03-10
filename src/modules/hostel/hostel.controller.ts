import { Controller, Post, Body, Patch, Param, ParseIntPipe, Get, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiQuery, ApiNoContentResponse } from '@nestjs/swagger';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { Role } from '@prisma/client';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { HostelService } from './hostel.service';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('hostels')
@ApiTags('Hostels')
@ApiBearerAuth()
export class HostelController {
    constructor(private readonly hostelService: HostelService) { }

    @Post()
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

}