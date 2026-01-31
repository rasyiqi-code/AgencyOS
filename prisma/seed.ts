import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Clean up existing data (Transactional only)
    console.log('🧹 Cleaning up transactional data...');

    // Disconnect relations first to avoid Foreign Key constraints
    await prisma.project.updateMany({ data: { serviceId: null, estimateId: null } });
    await prisma.estimate.updateMany({ data: { serviceId: null } });

    // Delete transactional data
    await prisma.supportMessage.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.dailyLog.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.brief.deleteMany();
    await prisma.order.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.estimate.deleteMany();
    await prisma.project.deleteMany();

    // NOT DELETING reference data: Services, SystemSettings, Coupons, MarketingBonuses

    // 2. Create Services (Idempotent)
    const services = [
        {
            title: 'Web Development Starter',
            title_id: 'Paket Pemula Web Development',
            description: 'Perfect for small businesses needing a professional online presence. Includes 5 pages, contact form, and mobile responsiveness.',
            description_id: 'Cocok untuk bisnis kecil yang membutuhkan kehadiran online profesional. Termasuk 5 halaman, formulir kontak, dan responsivitas seluler.',
            price: 1500,
            currency: 'USD',
            interval: 'one_time',
            features: ['5 Pages', 'Mobile Responsive', 'Contact Form', 'SEO Basic', '1 Month Support'],
            features_id: ['5 Halaman', 'Responsi Seluler', 'Formulir Kontak', 'SEO Dasar', 'Dukungan 1 Bulan'],
        },
        {
            title: 'E-Commerce Growth Plan',
            title_id: 'Paket Pertumbuhan E-Commerce',
            description: 'Scale your online store with ongoing maintenance, priority support, and monthly performance optimizations.',
            description_id: 'Tingkatkan toko online Anda dengan pemeliharaan berkelanjutan, dukungan prioritas, dan optimasi performa bulanan.',
            price: 299,
            currency: 'USD',
            interval: 'monthly',
            features: ['Monthly Maintenance', 'Performance Tuning', 'Priority Support', 'Security Patches', 'Analytics Report'],
            features_id: ['Pemeliharaan Bulanan', 'Tuning Performa', 'Dukungan Prioritas', 'Patch Keamanan', 'Laporan Analitik'],
        },
        {
            title: 'Enterprise Support (Annual)',
            title_id: 'Dukungan Enterprise (Tahunan)',
            description: 'Full-service dedicated support for large organizations needing guaranteed uptime and rapid response.',
            description_id: 'Dukungan penuh khusus untuk organisasi besar yang membutuhkan jaminan uptime dan respons cepat.',
            price: 50000000,
            currency: 'IDR',
            interval: 'yearly',
            features: ['24/7 Dedicated Support', 'Rapid Response Time', 'Server Monitoring', 'Legal Compliance', 'Quarterly Reviews'],
            features_id: ['Dukungan Khusus 24/7', 'Waktu Respons Cepat', 'Pemantauan Server', 'Kepatuhan Hukum', 'Tinjauan Kuartalan'],
        },
        {
            title: 'Custom Website Design',
            title_id: 'Desain Website Kustom',
            description: 'High-end custom website design tailored to your brand identity and business goals.',
            description_id: 'Desain website kustom kelas atas yang disesuaikan dengan identitas merek dan tujuan bisnis Anda.',
            price: 25000000,
            currency: 'IDR',
            interval: 'one_time',
            features: ['Custom UI/UX Design', 'High Performance', 'Interactive Elements', 'Brand Integration', 'Source Files Included'],
            features_id: ['Desain UI/UX Kustom', 'Performa Tinggi', 'Elemen Interaktif', 'Integrasi Merek', 'Termasuk File Sumber'],
        },
    ];

    for (const s of services) {
        const existing = await prisma.service.findFirst({ where: { title: s.title } });
        if (!existing) {
            const service = await prisma.service.create({
                data: s,
            });
            console.log(`Created service: ${service.title}`);
        } else {
            console.log(`Service exists: ${s.title}`);
        }
    }



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
// Force TS re-check
