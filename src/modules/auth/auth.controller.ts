import { Controller, Post, Body, Get, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';

import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // register
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiCreatedResponse({ type: AuthResponseDto })
    @ApiBadRequestResponse({
        description: 'Email already exists',
        type: ErrorResponseDto
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

    // reset-password
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using OTP' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Password updated successfully',
        schema: {
            example: {
                success: true,
                message: 'Password updated successfully. You can now login.'
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
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    // login
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'User login' })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials',
        type: ErrorResponseDto
    })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    // google
    @Post('google')
    @HttpCode(200) // Usually 200 for logins
    @ApiOperation({ summary: 'Google OAuth login/register' })
    @ApiOkResponse({
        description: 'Google login successful',
        type: AuthResponseDto
    })
    @ApiUnauthorizedResponse({
        description: 'Google authentication failed',
        type: ErrorResponseDto
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
    @ApiOkResponse({
        description: 'Returns access confirmation',
        schema: {
            example: { message: 'If you see this, AuthGuard and RolesGuard are working!' }
        }
    })
    @ApiUnauthorizedResponse({ type: ErrorResponseDto, description: 'Missing or invalid token' })
    @ApiForbiddenResponse({ type: ErrorResponseDto, description: 'Role not authorized' })
    getProfile() {
        return {
            message: 'If you see this, AuthGuard and RolesGuard are working!',
        };
    }
}