import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { StudentService } from './student.service';

import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiBearerAuth()
@Controller('student')
export class StudentController {
    constructor(private studentService: StudentService) { }

    // bookRoom
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
    @Get('bookings')
    @Roles(Role.student)
    @ApiBearerAuth()
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


}
