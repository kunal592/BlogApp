import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import {
    AdminStatsDto,
    UserListQueryDto,
    AdminUserResponseDto,
    UpdateUserRoleDto
} from './admin.dto';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    async getStats(): Promise<AdminStatsDto> {
        const [totalUsers, totalBlogs, totalComments, revenueResult] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.blog.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
            this.prisma.comment.count({ where: { deletedAt: null } }),
            this.prisma.purchase.aggregate({
                _sum: { amount: true },
                where: { status: 'COMPLETED' },
            }),
        ]);

        return {
            totalUsers,
            totalBlogs,
            totalComments,
            totalRevenue: (revenueResult._sum.amount || 0) / 100, // Convert paise to INR
        };
    }

    async getUsers(query: UserListQueryDto): Promise<{ data: AdminUserResponseDto[]; meta: any }> {
        const { page, limit, search, role } = query;
        const skip = (page - 1) * limit;

        const where: any = { deletedAt: null };

        if (role) {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            blogs: { where: { deletedAt: null, status: 'PUBLISHED' } },
                            followers: true,
                        }
                    }
                }
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users.map(user => ({
                id: user.id,
                email: user.email,
                username: user.username || '',
                name: user.name,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                stats: {
                    blogs: user._count.blogs,
                    followers: user._count.followers,
                }
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateUserRole(id: string, dto: UpdateUserRoleDto): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        await this.prisma.user.update({
            where: { id },
            data: { role: dto.role },
        });
    }

    async setBanStatus(id: string, isBanned: boolean): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        await this.prisma.user.update({
            where: { id },
            data: { isActive: !isBanned }, // isActive is opposite of banned
        });
    }

    async deleteBlog(id: string): Promise<void> {
        const blog = await this.prisma.blog.findUnique({ where: { id } });
        if (!blog) throw new NotFoundException('Blog not found');

        await this.prisma.blog.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'ARCHIVED' },
        });
    }
}
