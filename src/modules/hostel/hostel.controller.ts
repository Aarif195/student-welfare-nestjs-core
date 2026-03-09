import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { Role } from '@prisma/client';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { HostelService } from './hostel.service';

@Controller('hostels')
@ApiTags('Hostels')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Post()
  @Roles(Role.hostelOwner)
  @ApiOperation({ summary: 'Create a new hostel' })
  @ApiCreatedResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  create(@Body() createHostelDto: CreateHostelDto, @GetUser() user: any) {
    return this.hostelService.createHostel(user.id, createHostelDto);
  }
}