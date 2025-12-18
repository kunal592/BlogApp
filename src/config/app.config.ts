import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    name: process.env.APP_NAME || 'Knowledge Blog Platform',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',

    // Rate limiting
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },

    // Pagination defaults
    pagination: {
        defaultLimit: 20,
        maxLimit: 100,
    },
}));
