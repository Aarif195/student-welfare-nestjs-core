import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AdminLoginDto } from './dto/admin-login.dto';
import { DatabaseService } from '@/database/database.service';
import { RejectHostelDto } from './dto/admin-rejectHostel.dto';

import { bookingApprovedEmailTemplate, bookingRejectedEmailTemplate, hostelApprovedEmailTemplate, hostelRejectedEmailTemplate, notificationEmailTemplate } from '@/common/templates/auth-emails.template';

import { MailService } from '@/providers/mail/mail.service';
import { Role } from '@prisma/client';
import { AdminNotificationDto } from './dto/create-notification.dto';

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

  // getPendingBookings
  async getPendingBookings(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, bookings] = await this.prisma.$transaction([
      this.prisma.booking.count({ where: { booking_status: 'pending' } }),
      this.prisma.booking.findMany({
        where: { booking_status: 'pending' },
        skip,
        take: limit,
        orderBy: { booked_at: 'desc' },
        include: {
          student: { select: { firstName: true, lastName: true, email: true } },
          room: {
            select: {
              room_number: true,
              type: true,
              hostel: { select: { id: true, name: true, location: true } },
            },
          },
          payments: { select: { reference: true, amount: true, paid_at: true } },
        },
      }),
    ]);

    return {
      total,
      bookings: bookings.map(b => ({
        booking_id: b.id,
        student_id: b.student_id,
        room_id: b.room_id,
        booking_status: b.booking_status,
        booked_at: b.booked_at,
        start_date: b.start_date,
        end_date: b.end_date,
        price: b.price,
        rejection_reason: b.rejection_reason,
        student: b.student,
        room: b.room,
        payments: b.payments,
      })),
    };
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

  // rejectBooking
  async rejectBooking(bookingId: number, dto: RejectHostelDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      // Update Booking status
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          booking_status: 'rejected',
          rejection_reason: dto.reason
        },
        include: {
          student: { select: { firstName: true, email: true } },
          room: { select: { room_number: true } }
        },
      });

      // Update Payment status to completed refund
      await tx.payment.update({
        where: { booking_id: bookingId },
        data: { refund_status: 'completed' },
      });

      return booking;
    });

    // Send Email
    try {
      const emailBody = bookingRejectedEmailTemplate(
        result.student.firstName,
        result.room.room_number,
        dto.reason
      );
      await this.mailService.sendMail(result.student.email, 'Booking Update: Application Rejected', emailBody);
    } catch (error) {
      console.error('Booking Rejection Email failed:', error.message);
    }

    return result;
  }

  // getAllOwners
  async getAllOwners(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, owners] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: { role: Role.hostelOwner },
      }),
      this.prisma.user.findMany({
        where: { role: Role.hostelOwner },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, owners };
  }

  // getAllStudents
  async getAllStudents(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, students] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: { role: 'student' },
      }),
      this.prisma.user.findMany({
        where: { role: 'student' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, students };
  }

  // createNotification
  async createNotification(adminId: number, dto: AdminNotificationDto) {
    const { title, message, type, hostelId } = dto;

    //  Create the Database Record
    const notification = await this.prisma.notification.create({
      data: {
        title,
        message,
        type,
        hostel_id: type === 'hostel' ? hostelId : null,
        created_by: adminId,
        creator_role: 'superadmin',
      },
    });

    //  Fetch Recipient Emails
    let recipientEmails: string[] = [];
    if (type === 'global') {
      const students = await this.prisma.user.findMany({
        where: { role: 'student' },
        select: { email: true },
      });
      recipientEmails = students.map((s) => s.email);
    } else if (type === 'hostel' && hostelId) {
      const students = await this.prisma.booking.findMany({
        where: {
          room: { hostel_id: hostelId },
          booking_status: 'approved'
        },
        select: { student: { select: { email: true } } },
      });
      recipientEmails = students.map((b) => b.student.email);
    }

    //  Send Emails
    const emailBody = notificationEmailTemplate(title, message, 'Campus Administration');
    recipientEmails.forEach((email) => {
      this.mailService.sendMail(email, title, emailBody).catch((err) =>
        console.error(`Failed to send notification to ${email}:`, err.message)
      );
    });

    return notification;
  }

  // getNotifications
  async getAllNotifications(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, notifications] = await this.prisma.$transaction([
      this.prisma.notification.count(),
      this.prisma.notification.findMany({
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          hostel: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    return { total, notifications };
  }

  // deleteNotification
  async deleteNotification(notificationId: number) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }



}
