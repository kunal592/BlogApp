import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security Headers
  app.use(helmet());

  // Compression
  app.use(compression());

  const configService = app.get(ConfigService);

  // Get configuration values
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const frontendUrl = configService.get<string>(
    'app.frontendUrl',
    'http://localhost:3001',
  );
  const appName = configService.get<string>(
    'app.name',
    'Knowledge Blog Platform',
  );
  const isDev =
    configService.get<string>('app.env', 'development') === 'development';

  // Global prefix for all routes
  app.setGlobalPrefix(apiPrefix);

  // Cookie parser middleware
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: isDev ? true : frontendUrl, // Allow any origin in dev mode
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger API Documentation (only in development)
  if (isDev) {
    const config = new DocumentBuilder()
      .setTitle(appName)
      .setDescription(
        `
## AI-Powered Knowledge Blogging Platform API

This API powers a next-generation blogging platform with:
- 🔐 **Authentication** - JWT-based auth with HTTP-only cookies
- 👤 **User Profiles** - Public profiles, follow/unfollow, roles
- 📝 **Blogs** - Create, publish, and monetize content
- 🤖 **AI** - Summarization, SEO, Ask-AI (RAG)
- 💰 **Payments** - Token system, creator payouts

### Authentication
Most endpoints require authentication. Login first to get a JWT cookie.

### Roles
- **USER** - Can read and interact with content
- **CREATOR** - Can publish blogs
- **ADMIN** - Platform administration
- **OWNER** - Full platform control
      `.trim(),
      )
      .setVersion('1.0')
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User profile and social features')
      .addTag('Blogs', 'Blog CRUD and publishing')
      .addTag('Explore', 'Content discovery')
      .addTag('AI', 'AI-powered features')
      .addTag('Payments', 'Monetization and transactions')
      .addTag('Admin', 'Platform administration')
      .addCookieAuth('access_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'JWT token stored in HTTP-only cookie',
      })
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'bearer',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
      customSiteTitle: `${appName} - API Docs`,
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin-bottom: 20px; }
        .swagger-ui .info .title { font-size: 2rem; }
      `,
    });

    logger.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
  }

  await app.listen(port);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(
    `📝 Environment: ${configService.get<string>('app.env', 'development')}`,
  );
  logger.log(`🌐 Frontend URL: ${frontendUrl}`);
}

bootstrap();
