import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: DatabaseService) { }

  //   getProfile
 async getProfile(userId: number, role: string) {
  let user;

  //  Check the role is admin to decide which table to query
  if (role === 'superadmin') {
    user = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  } else {
    //  Otherwise, look in the standard User table (for students/hostelOwners)
    user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });
  }

  if (!user) throw new NotFoundException('User profile not found');
  
  return user;
}

  //   updateProfile
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    const { password, ...result } = user;
    return result;
  }
}