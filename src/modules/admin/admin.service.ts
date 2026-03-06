import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';
import { DatabaseService } from '@/database/database.service';

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



}