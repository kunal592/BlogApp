import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityNotesService } from './community-notes.service';
import { CreateNoteDto, VoteNoteDto, NoteResponseDto } from './community.dto';

@ApiTags('Community Notes')
@Controller('community/notes')
export class CommunityNotesController {
    constructor(private readonly notesService: CommunityNotesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a community note on a blog' })
    @ApiResponse({ status: 201, description: 'Note created', type: NoteResponseDto })
    async createNote(@Req() req: any, @Body() dto: CreateNoteDto) {
        return this.notesService.createNote(
            req.user.id,
            dto.blogId,
            dto.content,
            dto.quote,
        );
    }

    @Post(':id/vote')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Vote on a community note (Helpful / Not Helpful)' })
    @ApiResponse({ status: 200, description: 'Vote recorded' })
    async voteNote(
        @Req() req: any,
        @Param('id') noteId: string,
        @Body() dto: VoteNoteDto,
    ) {
        return this.notesService.voteNote(req.user.id, noteId, dto.isHelpful);
    }

    @Get('blog/:blogId')
    @ApiOperation({ summary: 'Get community notes for a blog' })
    @ApiResponse({ status: 200, description: 'List of notes', type: [NoteResponseDto] })
    async getNotes(@Param('blogId') blogId: string) {
        return this.notesService.getNotes(blogId);
    }
}
