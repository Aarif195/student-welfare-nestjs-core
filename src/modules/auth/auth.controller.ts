import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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