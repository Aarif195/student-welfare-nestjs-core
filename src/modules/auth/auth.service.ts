import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, comparePassword } from '../../common/utils/helpers';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { Role } from '@prisma/client';

import { MailService } from '../mail/mail.service';
import { OAuth2Client } from 'google-auth-library';
import { VerifyOtpDto } from './dto/verify-otp.dto';

// Initialize the client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  // register
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (existing) throw new BadRequestException('Email already exists');

    const hashedPassword = await hashPassword(dto.password);

    const { role, ...userData } = dto;
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        role:( dto.role as unknown as Role) || Role.student,
        password: hashedPassword,
        is_verified: false,
      },
    });


    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    // Save OTP in database
    await this.prisma.emailOtp.create({
      data: {
        email: dto.email,
        otp_code: otpCode,
        expires_at: expiresAt,
      },
    });

   // Send OTP Email
  try {
    await this.mailService.sendMail(
      dto.email,
      'Verify Your Account',
      `<p>Hi ${dto.firstName},</p>
       <p>Your verification code is: <strong>${otpCode}</strong></p>
       <p>This code expires in 10 minutes.</p>`,
    );
  } catch (error) {
    console.error('Email failed to send:', error.message);
  }

  return { message: 'Registration successful. Please check your email for the OTP.' };
}

  // login
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await comparePassword(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Add this check
    if (!user.is_verified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    return this.generateUserToken(user);
  }

  private generateUserToken(user: any) {
    const payload = { id: user.id, role: user.role };
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token: this.jwtService.sign(payload),
    };
  }

// verifyOTP
 async verifyOTP(dto: VerifyOtpDto) {
    //  Find the latest OTP for this email
    const otpData = await this.prisma.emailOtp.findFirst({
      where: { 
        email: dto.email, 
        otp_code: dto.otp_code 
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpData) {
      throw new BadRequestException('Invalid OTP code');
    }

    //  Check expiry
    if (new Date() > otpData.expires_at) {
      throw new BadRequestException('OTP has expired');
    }

    //  Update User status
    await this.prisma.user.update({
      where: { email: dto.email },
      data: { is_verified: true },
    });

    //  Delete the used OTP
    await this.prisma.emailOtp.delete({
      where: { id: otpData.id },
    });

    return { 
      success: true, 
      message: 'Email verified successfully. You can now login.' 
    };
  }

  // googleLogin
  async googleLogin(dto: GoogleLoginDto) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: dto.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) throw new BadRequestException('Invalid Google token');

      const email = payload.email;
      const firstName = payload.given_name || 'User';
      const lastName = payload.family_name || '';
      const image = payload.picture || null;

      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            image,
            role: dto.role as unknown as Role,
            phone: dto.phone || '',
            password: await hashPassword(Math.random().toString(36).slice(-10)),
            is_verified: true,
          },
        });

        //Welcome Email for Google users
        await this.mailService.sendMail(
          email,
          'Welcome to our platform!',
          `<p>Hi ${firstName}, your account has been created via Google.</p>`
        );
      }


      return this.generateUserToken(user);
    } catch (error) {
      throw new UnauthorizedException('Google authentication failed');
    }
  }


}