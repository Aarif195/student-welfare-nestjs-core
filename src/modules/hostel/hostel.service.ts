import { DatabaseService } from '@/database/database.service';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

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

// getMyHostels
async getMyHostels(owner_id: number, page: number, limit: number) {
  const [total, data] = await this.prisma.$transaction([
    this.prisma.hostel.count({ where: { owner_id } }),
    this.prisma.hostel.findMany({
      where: { owner_id },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { resources: true },
    }),
  ]);

  return {
    success: true,
    meta: { page, limit, total },
    data,
  };
}

// getSingleHostel
async getOne(id: number, owner_id: number) {
  const hostel = await this.prisma.hostel.findUnique({
    where: { id },
    include: { resources: true },
  });

  if (!hostel) throw new NotFoundException('Hostel not found');
  if (hostel.owner_id !== owner_id) throw new ForbiddenException('Unauthorized: You do not own this hostel');

  return { success: true, data: hostel };
}

// deleteHostel
async deleteHostel(id: number, owner_id: number) {
  const hostel = await this.prisma.hostel.findUnique({
    where: { id },
    select: { owner_id: true },
  });

  if (!hostel) throw new NotFoundException('Hostel not found');
  if (hostel.owner_id !== owner_id) throw new ForbiddenException('Unauthorized: Access denied');

  await this.prisma.hostel.delete({ where: { id } });
  return { success: true, message: 'Hostel deleted successfully' };
}

// createRoom
async createRoom(hostelId: number, owner_id: number, dto: CreateRoomDto) {
  const { resources, ...roomData } = dto;

  //  Verify ownership
  const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
  if (!hostel || hostel.owner_id !== owner_id) {
    throw new ForbiddenException('Unauthorized access');
  }

  //  Create room with mapped resources
  return await this.prisma.room.create({
    data: {
      ...roomData,
      hostel_id: hostelId,
      resources: resources ? {
        create: resources.map(r => ({
          url: r.file_url,
          type: r.file_type
        }))
      } : undefined,
    },
    include: { resources: true },
  });
}

// getRoomsByHostel
async getRoomsByHostel(hostelId: number, owner_id: number, page: number, limit: number) {
  //  Verify ownership
  const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
  if (!hostel || hostel.owner_id !== owner_id) {
    throw new ForbiddenException('Unauthorized access');
  }

  //  Count and find
  const [total, rooms] = await this.prisma.$transaction([
    this.prisma.room.count({ where: { hostel_id: hostelId } }),
    this.prisma.room.findMany({
      where: { hostel_id: hostelId },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { resources: true },
    }),
  ]);

  return {
    success: true,
    meta: { page, limit, total },
    MyRooms: rooms,
  };
}

// getSingleRoom
async getSingleRoom(hostelId: number, roomId: number, owner_id: number) {
  //  Verify ownership
  const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
  if (!hostel || hostel.owner_id !== owner_id) {
    throw new ForbiddenException('Unauthorized access');
  }

  //  Fetch room
  const room = await this.prisma.room.findFirst({
    where: { id: roomId, hostel_id: hostelId },
    include: { resources: true },
  });

  if (!room) {
    throw new NotFoundException('Room not found in this hostel');
  }

  return { success: true, data: room };
}

// updateRoom
async updateRoom(hostelId: number, roomId: number, owner_id: number, data: UpdateRoomDto) {
  const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
  if (!hostel || hostel.owner_id !== owner_id) {
    throw new ForbiddenException('Unauthorized access');
  }

  const room = await this.prisma.room.findFirst({
    where: { id: roomId, hostel_id: hostelId },
  });

  if (!room) {
    throw new NotFoundException('Room not found in this hostel');
  }

  return await this.prisma.room.update({
    where: { id: roomId },
    data,
  });
}

// deleteRoom
async deleteRoom(hostelId: number, roomId: number, owner_id: number) {
  //  Verify ownership
  const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
  if (!hostel || hostel.owner_id !== owner_id) {
    throw new ForbiddenException('Unauthorized access');
  }

  //  Verify room in hostel
  const room = await this.prisma.room.findFirst({
    where: { id: roomId, hostel_id: hostelId },
  });
  if (!room) {
    throw new NotFoundException('Room not found in this hostel');
  }

  //  Delete room
  await this.prisma.room.delete({ where: { id: roomId } });
  return { success: true, message: 'Room deleted successfully' };
}



}