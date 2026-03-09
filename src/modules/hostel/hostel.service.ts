import { DatabaseService } from '@/database/database.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHostelDto } from './dto/create-hostel.dto';

@Injectable()
export class HostelService {
  constructor(private prisma: DatabaseService) {}

async createHostel(owner_id: number, dto: CreateHostelDto) {
  try {
    const { resources, ...hostelData } = dto;

    const hostel = await this.prisma.hostel.create({
      data: {
        ...hostelData,
        owner_id,
        resources: {
          create: resources, 
        },
      },
      include: { resources: true },
    });

    return {
      success: true,
      message: 'Hostel created and awaiting admin approval',
      data: hostel,
    };
  } catch (error) {
    throw new BadRequestException('Error creating hostel. Please check your data.');
  }
}


}