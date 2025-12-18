import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
    RegisterDto,
    LoginDto,
    UserResponseDto,
    AuthResponseDto,
    JwtPayload,
} from './auth.dto';
import { MESSAGES } from '../../common/constants';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Register a new user
     */
    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        const { email, password, name } = dto;

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException(MESSAGES.AUTH.EMAIL_EXISTS);
        }

        // Hash password
        const saltRounds = this.configService.get<number>('auth.bcrypt.saltRounds', 12);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name: name || null,
            },
        });

        this.logger.log(`New user registered: ${user.email}`);

        // Generate token
        const accessToken = this.generateAccessToken(user);

        return {
            user: this.sanitizeUser(user),
            accessToken,
            message: MESSAGES.AUTH.REGISTER_SUCCESS,
        };
    }

    /**
     * Login user with email and password
     */
    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = dto;

        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException(MESSAGES.USER.INACTIVE);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
        }

        this.logger.log(`User logged in: ${user.email}`);

        // Generate token
        const accessToken = this.generateAccessToken(user);

        return {
            user: this.sanitizeUser(user),
            accessToken,
            message: MESSAGES.AUTH.LOGIN_SUCCESS,
        };
    }

    /**
     * Get current authenticated user by ID
     */
    async getMe(userId: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException(MESSAGES.USER.NOT_FOUND);
        }

        if (!user.isActive) {
            throw new UnauthorizedException(MESSAGES.USER.INACTIVE);
        }

        return this.sanitizeUser(user);
    }

    /**
     * Validate user from JWT payload
     * Used by JWT strategy
     */
    async validateUser(payload: JwtPayload): Promise<UserResponseDto | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user || !user.isActive || user.deletedAt) {
            return null;
        }

        return this.sanitizeUser(user);
    }

    /**
     * Generate JWT access token
     */
    private generateAccessToken(user: { id: string; email: string; role: string }): string {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role as JwtPayload['role'],
        };

        return this.jwtService.sign(payload);
    }

    /**
     * Remove sensitive fields from user object
     */
    private sanitizeUser(user: {
        id: string;
        email: string;
        name: string | null;
        bio: string | null;
        avatar: string | null;
        role: string;
        isActive: boolean;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role as UserResponseDto['role'],
            isActive: user.isActive,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    /**
     * Get cookie options for JWT token
     */
    getCookieOptions() {
        return {
            httpOnly: this.configService.get<boolean>('auth.cookie.httpOnly', true),
            secure: this.configService.get<boolean>('auth.cookie.secure', false),
            sameSite: this.configService.get<'strict' | 'lax' | 'none'>('auth.cookie.sameSite', 'lax'),
            maxAge: this.configService.get<number>('auth.cookie.maxAge', 7 * 24 * 60 * 60 * 1000),
            path: this.configService.get<string>('auth.cookie.path', '/'),
        };
    }

    /**
     * Get cookie name for JWT token
     */
    getCookieName(): string {
        return this.configService.get<string>('auth.cookie.name', 'access_token');
    }
}
