import { Controller, Get } from '@nestjs/common';
import {
    HealthCheckService,
    HealthCheck,
    PrismaHealthIndicator,
    MicroserviceHealthIndicator,
    MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';
import { Transport, RedisOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private prismaHealth: PrismaHealthIndicator,
        private prisma: PrismaService,
        private microservice: MicroserviceHealthIndicator,
        private memory: MemoryHealthIndicator,
        private configService: ConfigService,
    ) { }

    @Public()
    @Get()
    @HealthCheck()
    check() {
        const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

        return this.health.check([
            // Database Check
            () => this.prismaHealth.pingCheck('database', this.prisma),

            // Redis Check
            () =>
                this.microservice.pingCheck<RedisOptions>('redis', {
                    transport: Transport.REDIS,
                    options: {
                        host: redisHost,
                        port: redisPort,
                    },
                }),

            // Memory Check (Heap < 150MB)
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
        ]);
    }
}
