import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { AuthModule } from '../auth/auth.module';
import { CommunityNotesController } from './community-notes.controller';
import { CommunityNotesService } from './community-notes.service';

@Module({
    imports: [AuthModule],
    controllers: [CommunityController, CommunityNotesController],
    providers: [CommunityService, CommunityNotesService],
    exports: [CommunityService],
})
export class CommunityModule { }
