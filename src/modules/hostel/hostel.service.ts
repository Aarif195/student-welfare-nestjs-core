import { DatabaseService } from '@/database/database.service';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { notificationEmailTemplate } from '@/common/templates/auth-emails.template';
import { MailService } from '@/providers/mail/mail.service';
import { OwnerNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class HostelService {
  constructor(private prisma: DatabaseService, private mailService: MailService,
  ) { }

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

  // getOwnerBookings
  async getOwnerBookings(ownerId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, bookings] = await this.prisma.$transaction([
      this.prisma.booking.count({
        where: { room: { hostel: { owner_id: ownerId } } },
      }),
      this.prisma.booking.findMany({
        where: { room: { hostel: { owner_id: ownerId } } },
        skip,
        take: limit,
        orderBy: { booked_at: 'desc' },
        select: {
          booking_status: true,
          start_date: true,
          student: { select: { firstName: true, lastName: true, phone: true } },
          room: { select: { room_number: true } },
        },
      }),
    ]);

    return { success: true, meta: { page, limit, total }, data: bookings };
  }

  // createHostelNotification
  async createHostelNotification(ownerId: number, hostelId: number, dto: OwnerNotificationDto) {
    //  Ownership & Approval Check
    const hostel = await this.prisma.hostel.findFirst({
      where: {
        id: hostelId,
        owner_id: ownerId,
        status: 'APPROVED',
      },
    });

    if (!hostel) {
      throw new ForbiddenException(
        'Cannot create notification. Hostel must be approved and owned by you.',
      );
    }

    //  Create the Database Record
    const notification = await this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: 'hostel',
        hostel_id: hostelId,
        created_by: ownerId,
        creator_role: 'hostelOwner',
      },
    });

    //  Fetch Approved Student Emails for this Hostel
    const bookings = await this.prisma.booking.findMany({
      where: {
        room: { hostel_id: hostelId },
        booking_status: 'approved',
      },
      select: { student: { select: { email: true } } },
    });

    const recipientEmails = bookings.map((b) => b.student.email);

    //  Send Emails
    const emailBody = notificationEmailTemplate(dto.title, dto.message, hostel.name);
    recipientEmails.forEach((email) => {
      this.mailService.sendMail(email, dto.title, emailBody).catch((err) =>
        console.error(`Failed to send owner notification to ${email}:`, err.message),
      );
    });

    return notification;
  }

  // getHostelNotifications
  async getHostelNotifications(ownerId: number, hostelId: number) {
    //  Verify ownership
    const hostel = await this.prisma.hostel.findFirst({
      where: { id: hostelId, owner_id: ownerId },
    });

    if (!hostel) {
      throw new ForbiddenException('You can only view notifications for hostels you own.');
    }

    //  Fetch notifications
    const notifications = await this.prisma.notification.findMany({
      where: {
        hostel_id: hostelId,
        type: 'hostel',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        createdAt: true,
        type: true,
      },
    });

    return notifications;
  }

  // deleteNotification
async deleteHostelNotification(ownerId: number, notificationId: number) {
  const notification = await this.prisma.notification.findFirst({
    where: {
      id: notificationId,
      created_by: ownerId,
    },
  });

  if (!notification) {
    throw new ForbiddenException('You can only delete notifications you created.');
  }

  return this.prisma.notification.delete({
    where: { id: notificationId },
  });
}

}