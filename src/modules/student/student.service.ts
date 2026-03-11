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


  
}