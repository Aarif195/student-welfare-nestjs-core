import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';
import { DatabaseService } from '@/database/database.service';
import { RejectHostelDto } from './dto/admin-rejectHostel.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: DatabaseService,
    private jwt: JwtService,
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
    },
  });

  return updatedHostel;
}


// rejectHostel
async rejectHostel(hostelId: number, dto: RejectHostelDto) {
  const hostel = await this.prisma.hostel.findUnique({
    where: { id: hostelId },
  });

  if (!hostel) {
    throw new NotFoundException('Hostel not found');
  }

  return this.prisma.hostel.update({
    where: { id: hostelId },
    data: {
      status: 'REJECTED',
      rejection_reason: dto.reason || 'No reason provided',
      updated_at: new Date(),
    },
  });
}

}
