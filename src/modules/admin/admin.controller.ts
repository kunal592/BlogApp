import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiCookieAuth,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { ADMIN_API } from './admin.api';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
    AdminStatsDto,
    UserListQueryDto,
    AdminUserResponseDto,
    UpdateUserRoleDto
} from './admin.dto';

@ApiTags('Admin')
@Controller(ADMIN_API.BASE)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OWNER)
@ApiCookieAuth('access_token')
@ApiBearerAuth('bearer')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    @ApiResponse({ status: 200, type: AdminStatsDto })
    async getStats(): Promise<AdminStatsDto> {
        return this.adminService.getStats();
    }

    @Get('users')
    @ApiOperation({ summary: 'Get users list' })
    @ApiResponse({ status: 200, type: [AdminUserResponseDto] })
    async getUsers(
        @Query() query: UserListQueryDto,
    ): Promise<{ data: AdminUserResponseDto[]; meta: any }> {
        return this.adminService.getUsers(query);
    }

    @Patch('users/:id/role')
    @ApiOperation({ summary: 'Update user role' })
    @ApiResponse({ status: 200, description: 'Role updated' })
    async updateUserRole(
        @Param('id') id: string,
        @Body() dto: UpdateUserRoleDto,
    ): Promise<{ message: string }> {
        await this.adminService.updateUserRole(id, dto);
        return { message: 'User role updated successfully' };
    }

    @Patch('users/:id/ban')
    @ApiOperation({ summary: 'Ban user' })
    @ApiResponse({ status: 200, description: 'User banned' })
    async banUser(@Param('id') id: string): Promise<{ message: string }> {
        await this.adminService.setBanStatus(id, true);
        return { message: 'User banned successfully' };
    }

    @Patch('users/:id/unban')
    @ApiOperation({ summary: 'Unban user' })
    @ApiResponse({ status: 200, description: 'User unbanned' })
    async unbanUser(@Param('id') id: string): Promise<{ message: string }> {
        await this.adminService.setBanStatus(id, false);
        return { message: 'User unbanned successfully' };
    }

    @Delete('blogs/:id')
    @ApiOperation({ summary: 'Force delete blog' })
    @ApiResponse({ status: 200, description: 'Blog deleted' })
    async deleteBlog(@Param('id') id: string): Promise<{ message: string }> {
        await this.adminService.deleteBlog(id);
        return { message: 'Blog deleted successfully' };
    }
}
