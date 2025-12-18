import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            // Extract JWT from cookie or Authorization header
            jwtFromRequest: ExtractJwt.fromExtractors([
                // First try to extract from cookie
                (request: Request) => {
                    const cookieName = configService.get<string>('auth.cookie.name', 'access_token');
                    return request?.cookies?.[cookieName] || null;
                },
                // Fall back to Authorization header
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('auth.jwt.secret') || 'fallback-secret-key',
        });
    }

    /**
     * Validate JWT payload and return user
     * This is called automatically by Passport after verifying the JWT signature
     */
    async validate(payload: JwtPayload) {
        const user = await this.authService.validateUser(payload);

        if (!user) {
            throw new UnauthorizedException('Invalid token or user not found');
        }

        return user;
    }
}
