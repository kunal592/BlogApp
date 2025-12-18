import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
    imports: [
        // Configure multer for memory storage (buffer)
        MulterModule.register({
            storage: undefined, // Use memory storage
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB max
                files: 10, // Max 10 files
            },
        }),
    ],
    controllers: [MediaController],
    providers: [MediaService],
    exports: [MediaService],
})
export class MediaModule { }
