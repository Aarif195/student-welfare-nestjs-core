import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AdminLoginDto } from './dto/admin-login.dto';
import { DatabaseService } from '@/database/database.service';
import { RejectHostelDto } from './dto/admin-rejectHostel.dto';

import { bookingApprovedEmailTemplate, hostelApprovedEmailTemplate, hostelRejectedEmailTemplate } from '@/common/templates/auth-emails.template';

import { MailService } from '@/providers/mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: DatabaseService,
    private jwt: JwtService,
    private mailService: MailService,
  ) { }

  // login
  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.user.findUnique({
      where: { email: dto.email, role: 'superadmin' },
    });


    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const payload = { id: admin.id, email: admin.email, role: admin.role };

    return {
      message: 'Admin login successful',
      accessToken: await this.jwt.signAsync(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  // logout
  async logout() {
    return {
      success: true,
      message: 'Admin logged out successfully',
    };
  }

  // getAllHostels
  async getAllHostels(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, hostels] = await this.prisma.$transaction([
      this.prisma.hostel.count(),
      this.prisma.hostel.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return { total, hostels };
  }

  // approveHostel
  async approveHostel(hostelId: number) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id: hostelId },
    });

    if (!hostel) {
      throw new NotFoundException('Hostel not found');
    }

    const updatedHostel = await this.prisma.hostel.update({
      where: { id: hostelId },
      data: {
        status: 'APPROVED',
        updated_at: new Date()
      }, include: { owner: true }
    });

    //  Send Email
    try {
      const emailBody = hostelApprovedEmailTemplate(updatedHostel.name);
      await this.mailService.sendMail(updatedHostel.owner.email, 'Hostel Approved', emailBody);
    } catch (error) {
      console.error('Approval Email failed:', error.message);
    }

    return updatedHostel;
  }

  // rejectHostel
  async rejectHostel(hostelId: number, dto: RejectHostelDto) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id: hostelId },
      include: { owner: true }
    });

    if (!hostel) {
      throw new NotFoundException('Hostel not found');
    }

    const rejectedHostel = await this.prisma.hostel.update({
      where: { id: hostelId },
      data: {
        status: 'REJECTED',
        rejection_reason: dto.reason || 'No reason provided',
        updated_at: new Date(),
      },
      include: { owner: true },
    });

    // Send Email
    try {
      const emailBody = hostelRejectedEmailTemplate(rejectedHostel.name, dto.reason || 'No reason provided');
      await this.mailService.sendMail(rejectedHostel.owner.email, 'Hostel Application Update', emailBody);
    } catch (error) {
      console.error('Rejection Email failed:', error.message);
    }

    return rejectedHostel;
  }

// approveBooking
async approveBooking(bookingId: number) {
  const result = await this.prisma.$transaction(async (tx) => {
    // Update Booking status
    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: { booking_status: 'approved' },
      include: { student: { select: { email: true } } },
    });

    // Flip Room Availability to false
    await tx.room.update({
      where: { id: booking.room_id },
      data: { availability: false },
    });

    return booking;
  });

  // Send Email (outside transaction)
  try {
    const emailBody = bookingApprovedEmailTemplate(bookingId);
    await this.mailService.sendMail(result.student.email, 'Booking Approved!', emailBody);
  } catch (error) {
    console.error('Booking Approval Email failed:', error.message);
  }

  return result;
}


}
