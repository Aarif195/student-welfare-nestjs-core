import { Prisma } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { verifyPayment } from '@/common/utils/helpers';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class StudentService {
  constructor(private prisma: DatabaseService) { }

  // bookRoom
  async bookRoom(studentId: number, data: CreateBookingDto) {

    //  Check room availability
    const room = await this.prisma.room.findUnique({ where: { id: data.room_id } });
    if (!room || !room.availability) {
      throw new BadRequestException('Room unavailable');
    }

    //  Verify payment (Manual util check)
    const isValid = await verifyPayment(data.reference);
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
            payment_status: 'success',
            paid_at: new Date(),
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

    return await this.prisma.booking.findMany({
      where: { student_id: studentId },
      orderBy: { booked_at: 'desc' },
      skip,
      take: limit,
      include: {
        room: {
          include: {
            hostel: true,
          },
        },
        payments: true,
      },
    });
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

}