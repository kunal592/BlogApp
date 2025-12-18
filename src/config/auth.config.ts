import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '604800', 10), // 7 days in seconds
        refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '2592000', 10), // 30 days in seconds
    },

    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    },

    cookie: {
        name: process.env.AUTH_COOKIE_NAME || 'access_token',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: '/',
    },
}));
