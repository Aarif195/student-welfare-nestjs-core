import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // register
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        schema: {
            example: {
                user: { id: 1, email: 'user@example.com', role: 'student', firstName: 'John', lastName: 'Doe' },
                token: 'jwt_token_here'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Email already exists',
        schema: {
            example: {
                success: false,
                message: 'Email already exists',
                statusCode: 400
            }
        }
    })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    // verify otp
    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify email with OTP' })
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({
        status: 200,
        description: 'Email verified successfully',
        schema: {
            example: {
                success: true,
                message: 'Email verified successfully. You can now login.'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid or expired OTP',
        schema: {
            example: {
                success: false,
                message: 'Invalid OTP code',
                statusCode: 400
            }
        }
    })
    verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.authService.verifyOTP(verifyOtpDto);
    }

    // resendOTP
    @Post('resend-otp')
    @ApiOperation({ summary: 'Resend verification OTP' })
    @ApiBody({ type: ResendOtpDto })
    @ApiResponse({
        status: 200,
        description: 'OTP resent successfully',
        schema: {
            example: {
                success: true,
                message: 'New OTP sent to your email.'
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
        schema: {
            example: {
                success: false,
                message: 'User not found',
                statusCode: 404
            }
        }
    })
    resendOTP(@Body() resendOtpDto: ResendOtpDto) {
        return this.authService.resendOTP(resendOtpDto);
    }

    // forgot-password
    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset OTP' })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Reset OTP sent successfully',
        schema: {
            example: {
                success: true,
                message: 'Reset OTP sent to your email'
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
        schema: {
            example: {
                success: false,
                message: 'User with this email does not exist',
                statusCode: 404
            }
        }
    })
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    // login
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 201,
        description: 'User logged in successfully',
        schema: {
            example: {
                user: { id: 1, email: 'john@example.com', role: 'student', firstName: 'John', lastName: 'Doe' },
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
        schema: {
            example: {
                success: false,
                message: 'Invalid credentials',
                statusCode: 401
            }
        }
    })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    // google
    @Post('google')
    @ApiOperation({ summary: 'Google OAuth login/register' })
    @ApiBody({ type: GoogleLoginDto })
    @ApiResponse({
        status: 201,
        description: 'Google login successful',
        schema: {
            example: {
                user: {
                    id: 1,
                    email: 'user@gmail.com',
                    role: 'student',
                    firstName: 'John',
                    lastName: 'Doe',
                    image: 'https://lh3.googleusercontent.com/...'
                },
                token: 'jwt_token_here'
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Google authentication failed',
        schema: {
            example: {
                success: false,
                message: 'Google authentication failed',
                statusCode: 401
            }
        }
    })
    googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
        return this.authService.googleLogin(googleLoginDto);
    }

    // Guards work
    @Get('profile')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('student', 'superadmin')
    @ApiOperation({ summary: 'Get profile (Protected Route Test)' })
    @ApiResponse({ status: 200, description: 'Returns user role and access confirmation' })
    getProfile() {
        return { message: 'If you see this, AuthGuard and RolesGuard are working!' };
    }
}