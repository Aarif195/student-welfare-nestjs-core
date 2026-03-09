import { Controller, Post, Body, Patch, Param, ParseIntPipe, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { Role } from '@prisma/client';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { HostelService } from './hostel.service';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

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
    getMyHostels(
        @GetUser() user: { id: number },
        @Query() pagination: PaginationDto,
    ) {
        const { page = 1, limit = 10 } = pagination;
        return this.hostelService.getMyHostels(user.id, page, limit);
    }

}