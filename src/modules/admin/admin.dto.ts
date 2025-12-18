import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';

export class AdminStatsDto {
    @ApiProperty()
    totalUsers!: number;

    @ApiProperty()
    totalBlogs!: number;

    @ApiProperty()
    totalComments!: number;

    @ApiProperty()
    totalRevenue!: number; // In standard currency units (e.g. INR)
}

export class UserListQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page: number = 1;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit: number = 20;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: Role })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}

export class UpdateUserRoleDto {
    @ApiProperty({ enum: Role })
    @IsEnum(Role)
    role!: Role;
}

export class AdminUserResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty()
    username!: string;

    @ApiProperty()
    name!: string | null;

    @ApiProperty()
    role!: string;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty()
    isVerified!: boolean;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    stats!: {
        blogs: number;
        followers: number;
    }
}
