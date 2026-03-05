import { Controller, Post, Body, Get, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse } from '@nestjs/swagger';


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
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // register
    @Public()
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiCreatedResponse({
        description: 'User registered successfully',
        type: AuthResponseDto
    })
    @ApiBadRequestResponse({
        description: 'Email already exists',
        type: ErrorResponseDto
    })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    // verify otp
    @Public()
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify email with OTP' })
    @ApiBody({ type: VerifyOtpDto })
    @ApiOkResponse({
        description: 'Email verified successfully',
        type: MessageResponseDto
    })
    @ApiBadRequestResponse({
        description: 'Invalid or expired OTP',
        type: ErrorResponseDto
    })
    verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.authService.verifyOTP(verifyOtpDto);
    }

    // resendOTP
    @Public()
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('resend-otp')
    @ApiOperation({ summary: 'Resend verification OTP' })
    @ApiBody({ type: ResendOtpDto })
    @ApiOkResponse({
        description: 'OTP resent successfully',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'User not found',
        type: ErrorResponseDto
    })
    resendOTP(@Body() resendOtpDto: ResendOtpDto) {
        return this.authService.resendOTP(resendOtpDto);
    }

    // forgot-password
    @Public()
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset OTP' })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiOkResponse({
        description: 'Password reset OTP sent successfully',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'User not found',
        type: ErrorResponseDto
    })
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    // reset-password
    @Public()
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using OTP' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiOkResponse({
        description: 'Password reset successful',
        type: MessageResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Invalid or expired OTP',
        type: ErrorResponseDto
    })
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    // login
    @Public()
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto })
    @ApiOkResponse({
        description: 'User logged in successfully',
        type: AuthResponseDto
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials',
        type: ErrorResponseDto
    })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    // google
    @Public()
    @Post('google')
    @HttpCode(200)
    @ApiOperation({ summary: 'Google OAuth login/register' })
    @ApiBody({ type: GoogleLoginDto })
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
    @Roles(Role.student, Role.superadmin)
    @ApiOperation({ summary: 'Get profile (Protected Route Test)' })
    @ApiOkResponse({
        description: 'Returns access confirmation',
        schema: {
            example: { message: 'AuthGuard and RolesGuard are working!' }
        }
    })
    @ApiUnauthorizedResponse({ type: ErrorResponseDto, description: 'Missing or invalid token' })
    @ApiForbiddenResponse({ type: ErrorResponseDto, description: 'Role not authorized' })
    getProfile() {
        return {
            message: 'AuthGuard and RolesGuard are working!',
        };
    }
}