import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Create Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blogapp.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            username: 'admin',
            password: hashedPassword,
            name: 'Platform Admin',
            role: Role.ADMIN,
            isVerified: true,
            bio: 'Official Platform Administrator',
        },
    });

    console.log(`✅ Admin user verified: ${admin.email}`);

    // 2. Ensure Admin has a Wallet (for Ledger System)
    await prisma.wallet.upsert({
        where: { userId: admin.id },
        update: {},
        create: {
            userId: admin.id,
            balance: 0,
        },
    });

    console.log(`✅ Admin wallet verified`);

    // 3. Create Default Tags
    const defaultTags = [
        'Technology',
        'Business',
        'Lifestyle',
        'AI',
        'Crypto',
        'Programming',
        'Startups',
        'Design',
        'Health',
        'Science',
    ];

    console.log('🏷️  Seeding tags...');

    for (const tagName of defaultTags) {
        const slug = tagName.toLowerCase();
        await prisma.tag.upsert({
            where: { slug },
            update: {},
            create: {
                name: tagName,
                slug,
            },
        });
    }

    console.log(`✅ ${defaultTags.length} tags verified`);

    console.log('🌱 Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
