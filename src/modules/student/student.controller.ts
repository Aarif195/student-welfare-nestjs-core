import { Roles } from '@/common/decorators/roles.decorator';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Role } from '@prisma/client';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
    constructor(private studentService: StudentService) { }

    @Post('bookings')
    @Roles(Role.student)
    @ApiOperation({ summary: 'Book a room' })
    @ApiCreatedResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    bookRoom(
        @GetUser() user: { id: number },
        @Body() createBookingDto: CreateBookingDto,
    ) {

        return this.studentService.bookRoom(user.id, createBookingDto);
    }

}
