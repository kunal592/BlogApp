import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';

// Configuration
import { appConfig, authConfig, aiConfig, paymentConfig, storageConfig } from './config';

// Prisma
import { PrismaModule } from './prisma/prisma.module';

// Common
import { AllExceptionsFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';
import { RolesGuard } from './common/guards';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { MediaModule } from './modules/media/media.module';
import { ExploreModule } from './modules/explore/explore.module';
import { AIModule } from './modules/ai/ai.module';
import { CommunityModule } from './modules/community/community.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, aiConfig, paymentConfig, storageConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Serve static files (test page)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
      serveStaticOptions: {
        index: ['index.html'],
      },
    }),

    // Database
    PrismaModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    BlogsModule,
    MediaModule,
    ExploreModule,
    AIModule,
    CommunityModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },

    // Global response transformer
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    // Global JWT authentication guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Global roles guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
