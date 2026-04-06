import { Prisma } from '@prisma/client';
import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { verifyPayment } from '@/common/utils/helpers';
import { DatabaseService } from '@/database/database.service';

import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class StudentService {
  private stripe: Stripe;
  constructor(private prisma: DatabaseService, private configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is missing from config');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  // bookRoom
  async bookRoom(studentId: number, data: CreateBookingDto) {

    //  Check room availability
    const roomId = Number(data.room_id);
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });

    if (!room || !room.availability) {
      throw new BadRequestException('Room unavailable');
    }

    //  Verify payment (Manual util check)
    if (!data.reference.startsWith('pi_')) {
      throw new BadRequestException('Invalid payment reference format');
    }

    const isValid = await verifyPayment(data.reference, this.stripe);

    if (!isValid) {
      throw new BadRequestException('Payment verification failed');
    }

    //  Create Booking & Payment in Transaction
    try {
      return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const booking = await tx.booking.create({
          data: {
            student_id: studentId,
            room_id: data.room_id,
            price: room.price,
            start_date: new Date(),
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 12)),
            booking_status: 'pending',
          },
        });

        await tx.payment.create({
          data: {
            booking_id: booking.id,
            student_id: studentId,
            amount: room.price,
            reference: data.reference,
            payment_status: 'pending',
            paid_at: null,
          },
        });

        return { success: true, message: 'Booking pending admin approval', booking_id: booking.id };
      });
    } catch (error) {
      console.error('Prisma Transaction Error:', error);
      throw error;
    }
  }

  // getMyBookings
  async getMyBookings(studentId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const bookings = await this.prisma.booking.findMany({
      where: { student_id: studentId },
      orderBy: { booked_at: 'desc' },
      skip,
      take: limit,
      include: {
        room: { include: { hostel: true } },
        payments: true,
      },
    });

    return bookings.map(b => ({
      booking_id: b.id,
      student_id: b.student_id,
      room_id: b.room_id,
      booking_status: b.booking_status,
      booked_at: b.booked_at,
      start_date: b.start_date,
      end_date: b.end_date,
      price: b.price,
      rejection_reason: b.rejection_reason,
      room: b.room,
      payments: b.payments,
    }));
  }

  // cancelBooking
  async cancelBooking(bookingId: number, studentId: number) {
    return await this.prisma.$transaction(async (tx) => {
      //  Find the booking
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, student_id: studentId },
      });

      if (!booking) throw new Error("Booking not found");
      if (booking.booking_status !== "pending") {
        throw new Error("Only pending bookings can be cancelled. Please contact admin.");
      }

      //  Update Booking
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { booking_status: 'cancelled' },
        select: { id: true, booking_status: true },
      });

      //  Update Payment
      const updatedPayment = await tx.payment.updateMany({
        where: { booking_id: bookingId },
        data: { refund_status: 'completed' },
      });

      return { ...updatedBooking, refund_status: 'completed' };
    });
  }

  // getAvailableHostels
  async getAvailableHostels(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, hostels] = await this.prisma.$transaction([
      this.prisma.hostel.count({ where: { status: 'APPROVED' } }),
      this.prisma.hostel.findMany({
        where: { status: 'APPROVED' },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { total, hostels };
  }

  // getAvailableRooms
  async getAvailableRooms(filters: any, page: number, limit: number, sort?: string) {
    const { hostel_id, price, capacity } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      availability: true,
      hostel: { status: 'APPROVED' },
      bookings: {
        none: {
          booking_status: { in: ['pending', 'approved'] }
        }
      },
      ...(hostel_id && { hostel_id: Number(hostel_id) }),
      ...(price && { price: { lte: Number(price) } }),
      ...(capacity && { capacity: Number(capacity) }),
    };

    const orderBy: any = sort === 'price_asc'
      ? { price: 'asc' }
      : sort === 'price_desc'
        ? { price: 'desc' }
        : { created_at: 'desc' }

    const [total, rooms] = await this.prisma.$transaction([
      this.prisma.room.count({ where }),
      this.prisma.room.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { hostel: true }
      }),
    ]);

    return { total, rooms };
  }

  // getMyNotifications
  async getMyNotifications(studentId: number, page: number, limit: number) {

    // Find the student's approved booking to get their hostel_id
    const approvedBooking = await this.prisma.booking.findFirst({
      where: {
        student_id: studentId,
        booking_status: 'approved',
      },
      select: {
        room: {
          select: { hostel_id: true }
        }
      }
    });

    const studentHostelId = approvedBooking?.room?.hostel_id || null;

    //  Fetch notifications that are GLOBAL or for THEIR HOSTEL
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { type: 'global' },
        {
          AND: [
            { type: 'hostel' },
            { hostel_id: studentHostelId }
          ]
        }
      ]
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          hostel: { select: { name: true } },
          author: { select: { firstName: true, lastName: true } }, readBy: {
            where: { student_id: studentId },
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.notification.count({ where })
    ]);

    return { notifications, total };

  }

  // markAsRead
  async markAsRead(studentId: number, notificationId: number) {
    return this.prisma.notificationRead.upsert({
      where: {
        notification_id_student_id: {
          notification_id: notificationId,
          student_id: studentId,
        },
      },
      update: {},
      create: {
        notification_id: notificationId,
        student_id: studentId,
      },
    });
  }

  //  MAINTENANCE 
  // Create Maintenance Request

  async createRequest(studentId: number, dto: CreateMaintenanceDto) {
    // Verify student has an APPROVED booking
    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        student_id: studentId,
        booking_status: 'approved',
      },
      select: {
        room_id: true,
        room: { select: { hostel_id: true } }
      }
    });

    if (!activeBooking) {
      throw new ForbiddenException('You must have an approved booking to request maintenance.');
    }

    //  Create the request
    return this.prisma.maintenanceRequest.create({
      data: {
        student_id: studentId,
        hostel_id: activeBooking.room.hostel_id,
        room_id: activeBooking.room_id,
        title: dto.title,
        description: dto.description,
        image_url: dto.image_url,
      },
    });
  }

  // Get Maintenance Request
  async getMyMaintenance(studentId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.prisma.maintenanceRequest.findMany({
        where: { student_id: studentId },
        skip,
        take: limit,
        include: {
          hostel: { select: { name: true } },
          room: { select: { room_number: true } }
        },
        orderBy: { created_at: 'desc' }
      }),
      this.prisma.maintenanceRequest.count({
        where: { student_id: studentId }
      })
    ]);

    return { requests, total };
  }

  // getMyMaintenanceRequestById
  async getMyMaintenanceRequestById(studentId: number, requestId: number) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id: requestId, student_id: studentId },
      include: {
        hostel: { select: { name: true } },
        room: { select: { room_number: true } }
      }
    });

    if (!request) {
      throw new BadRequestException('Maintenance request not found');
    }

    return request;
  }

// createReview
async createReview(studentId: number, dto: CreateReviewDto) {
  //   Check for an approved booking for this specific hostel
  const hasStayed = await this.prisma.booking.findFirst({
    where: {
      student_id: studentId,
      room: { hostel_id: dto.hostel_id },
      booking_status: 'approved',
    },
  });

  if (!hasStayed) {
    throw new ForbiddenException('You can only review hostels where you have an approved booking.');
  }

  //  Check if review already exists
  const existingReview = await this.prisma.review.findUnique({
    where: {
      student_id_hostel_id: {
        student_id: studentId,
        hostel_id: dto.hostel_id,
      },
    },
  });

  if (existingReview) {
    throw new ConflictException('You have already reviewed this hostel.');
  }

  // Create Review
  return this.prisma.review.create({
    data: {
      student_id: studentId,
      hostel_id: dto.hostel_id,
      rating: dto.rating,
      comment: dto.comment,
    },
  });
}


}