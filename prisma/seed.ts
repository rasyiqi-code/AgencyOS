import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Clean up existing data
    await prisma.service.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.marketingBonus.deleteMany();
    // await prisma.project.deleteMany(); // Keeping projects for now unless requested

    // 2. Create Services
    const services = [
        {
            title: 'Web Development Starter',
            description: 'Perfect for small businesses needing a professional online presence. Includes 5 pages, contact form, and mobile responsiveness.',
            price: 1500,
            interval: 'one_time',
            features: ['5 Pages', 'Mobile Responsive', 'Contact Form', 'SEO Basic', '1 Month Support'],
        },
        {
            title: 'E-Commerce Pro',
            description: 'Complete online store solution with payment gateway, product management, and inventory tracking.',
            price: 3500,
            interval: 'one_time',
            features: ['Unlimited Products', 'Payment Gateway', 'Inventory Management', 'User Accounts', 'Admin Dashboard'],
        },
        {
            title: 'Enterprise Retainer',
            description: 'Ongoing dedicated support and development for scaling businesses.',
            price: 2000,
            interval: 'monthly',
            features: ['Dedicated Developer', 'Priority Support', 'Weekly Updates', 'Server Management', 'Custom Features'],
        },
    ];

    for (const s of services) {
        const service = await prisma.service.create({
            data: s,
        });
        console.log(`Created service: ${service.title}`);
    }

    // Create System Settings
    const settings = [
        { key: 'bank_name', value: 'BCA', description: 'Bank Name' },
        { key: 'bank_account', value: '123 456 7890', description: 'Account Number' },
        { key: 'bank_holder', value: 'PT Crediblemark', description: 'Account Holder Name' },

        // R2 Storage
        { key: 'r2_endpoint', value: 'https://150d6660ac49b58a02b6489155ddeaab.r2.cloudflarestorage.com', description: 'Cloudflare R2 Endpoint' },
        { key: 'r2_access_key_id', value: '64f7444dc3ee2ef80baeae321e0b3b5c', description: 'R2 Access Key' },
        { key: 'r2_secret_access_key', value: '831f7bf346e8ea37b5db957e2a982e2466c7c55a98c48390b4bbd422fc505894', description: 'R2 Secret Key' },
        { key: 'r2_public_domain', value: 'https://pub-8444e4b7ff014377afa695d532f922cd.r2.dev', description: 'R2 Public Domain' },
    ];

    for (const s of settings) {
        await prisma.systemSetting.upsert({
            where: { key: s.key },
            update: {}, // Don't overwrite if exists (to preserve manual changes), but for seed/reset it will create.
            create: s
        });
    }
    console.log('Created System Settings.');

    // 4. Create Marketing Data (Coupons & Bonuses)

    // Coupons
    const coupons = [
        { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, isActive: true },
        { code: 'LAUNCH50', discountType: 'fixed', discountValue: 50, isActive: true },
        { code: 'VIP20', discountType: 'percentage', discountValue: 20, isActive: true },
    ];

    for (const c of coupons) {
        await prisma.coupon.upsert({
            where: { code: c.code },
            update: {},
            create: c
        });
    }
    console.log('Created Coupons.');

    // Bonuses
    const bonuses = [
        { title: '1 Year Server Maintenance', value: 'Worth $500', icon: 'Server', isActive: true },
        { title: 'Basic SEO Setup', value: 'Worth $300', icon: 'Search', isActive: true },
        { title: 'AgencyOS Dashboard Access', value: null, icon: 'LayoutDashboard', isActive: true },
        { title: 'Priority Support (1 Month)', value: null, icon: 'Headphones', isActive: true },
    ];

    for (const b of bonuses) {
        // We use findFirst to simulate upsert on non-unique fields for seeding idempotency
        const existing = await prisma.marketingBonus.findFirst({
            where: { title: b.title }
        });

        if (!existing) {
            await prisma.marketingBonus.create({ data: b });
        }
    }
    console.log('Created Marketing Bonuses.');


    // 3. Create Demo Projects - DISABLED PER USER REQUEST
    // const userIds = ['user_demo_123']; // Mock user ID

    // await prisma.project.create({
    //     data: {
    //         userId: userIds[0],
    //         title: 'Redesign Landing Page',
    //         description: 'Modernize the current landing page with new branding guidelines.',
    //         status: 'queue',
    //         spec: 'Use the new color palette. Hero section needs a video background.',
    //     },
    // });

    // await prisma.project.create({
    //     data: {
    //         userId: userIds[0],
    //         title: 'API Integration for Mobile App',
    //         description: 'Connect the React Native app to the backend strictly via REST API.',
    //         status: 'dev',
    //         repoOwner: 'agency-os',
    //         repoName: 'mobile-api',
    //         repoUrl: 'https://github.com/agency-os/mobile-api',
    //         spec: 'Endpoints required: /auth, /products, /orders.',
    //     },
    // });

    // await prisma.project.create({
    //     data: {
    //         userId: userIds[0],
    //         title: 'Corporate Dashboard',
    //         description: 'Internal analytical dashboard for finance team.',
    //         status: 'done',
    //         spec: 'Charts using Recharts. Data export to CSV.',
    //     },
    // });

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
