import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { AuthModule } from '../auth/auth.module'; // for OptionalJwtAuthGuard if needed, but logic is in guard file

@Module({
    imports: [AuthModule],
    controllers: [CommunityController],
    providers: [CommunityService],
    exports: [CommunityService],
})
export class CommunityModule { }
