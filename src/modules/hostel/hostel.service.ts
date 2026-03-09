import { DatabaseService } from '@/database/database.service';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';

@Injectable()
export class HostelService {
  constructor(private prisma: DatabaseService) {}

//   createHostel
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

// updateHostel
async updateHostel(hostelId: number, owner_id: number, dto: UpdateHostelDto) {
  const hostel = await this.prisma.hostel.findUnique({
    where: { id: hostelId },
    select: { owner_id: true },
  });

  if (!hostel) {
    throw new NotFoundException('Hostel not found');
  }

  if (hostel.owner_id !== owner_id) {
    throw new ForbiddenException('Unauthorized: Access denied');
  }

  const { resources, ...hostelData } = dto;

  const updatedHostel = await this.prisma.hostel.update({
    where: { id: hostelId },
    data: {
      ...hostelData,
      resources: resources ? {
        deleteMany: {},
        create: resources, 
      } : undefined,
    },
    include: { resources: true }
  });

  return {
    success: true,
    message: 'Hostel updated successfully',
    data: updatedHostel,
  };
}



}