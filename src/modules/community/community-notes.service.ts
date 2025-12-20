import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NoteStatus } from '@prisma/client';

@Injectable()
export class CommunityNotesService {
    private readonly logger = new Logger(CommunityNotesService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a community note
     */
    async createNote(userId: string, blogId: string, content: string, quote?: string) {
        const blog = await this.prisma.blog.findUnique({
            where: { id: blogId },
            select: { authorId: true, status: true },
        });

        if (!blog) throw new NotFoundException('Blog not found');
        if (blog.status !== 'PUBLISHED') throw new ForbiddenException('Blog not published');
        if (blog.authorId === userId) throw new ForbiddenException('Cannot note your own blog');

        const note = await this.prisma.communityNote.create({
            data: {
                userId,
                blogId,
                content,
                quote,
                status: 'PENDING', // Default to PENDING until verified or voted useful
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isVerified: true,
                    },
                },
            },
        });

        this.logger.log(`Note created by ${userId} on blog ${blogId}`);
        return note;
    }

    /**
     * Vote on a note (Helpful / Not Helpful)
     */
    async voteNote(userId: string, noteId: string, isHelpful: boolean) {
        const note = await this.prisma.communityNote.findUnique({ where: { id: noteId } });
        if (!note) throw new NotFoundException('Note not found');

        const existingVote = await this.prisma.noteVote.findUnique({
            where: { userId_noteId: { userId, noteId } },
        });

        if (existingVote) {
            if (existingVote.isHelpful === isHelpful) {
                return; // No change
            }
            // Change vote
            await this.prisma.$transaction([
                this.prisma.noteVote.update({
                    where: { id: existingVote.id },
                    data: { isHelpful },
                }),
                this.prisma.communityNote.update({
                    where: { id: noteId },
                    data: {
                        helpfulCount: isHelpful ? { increment: 1 } : { decrement: 1 },
                        notHelpfulCount: isHelpful ? { decrement: 1 } : { increment: 1 },
                        score: isHelpful ? { increment: 2 } : { decrement: 2 }, // Simple score logic
                    },
                }),
            ]);
        } else {
            // New vote
            await this.prisma.$transaction([
                this.prisma.noteVote.create({
                    data: { userId, noteId, isHelpful },
                }),
                this.prisma.communityNote.update({
                    where: { id: noteId },
                    data: {
                        helpfulCount: isHelpful ? { increment: 1 } : { increment: 0 },
                        // actually decrement/increment
                        [isHelpful ? 'helpfulCount' : 'notHelpfulCount']: { increment: 1 },
                        score: isHelpful ? { increment: 1 } : { decrement: 1 },
                    }
                })
            ]);
        }
    }

    /**
     * Get notes for a blog
     */
    async getNotes(blogId: string) {
        return this.prisma.communityNote.findMany({
            where: { blogId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isVerified: true,
                    },
                },
            },
            orderBy: { score: 'desc' }, // Best notes first
        });
    }
}
