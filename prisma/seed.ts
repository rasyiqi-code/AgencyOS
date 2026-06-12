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
    await prisma.feedbackComment.deleteMany();
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
            slug: 'web-development-starter',
            description: 'Perfect for small businesses needing a professional online presence. Includes 5 pages, contact form, and mobile responsiveness.',
            description_id: 'Cocok untuk bisnis kecil yang membutuhkan kehadiran online profesional. Termasuk 5 halaman, formulir kontak, dan responsivitas seluler.',
            price: 1500,
            currency: 'USD',
            interval: 'one_time',
            features: ['5 Pages', 'Mobile Responsive', 'Contact Form', 'SEO Basic', '1 Month Support'],
            features_id: ['5 Halaman', 'Responsi Seluler', 'Formulir Kontak', 'SEO Dasar', 'Dukungan 1 Bulan'],
            addons: [
                { name: 'Extra Page', description: 'Add one additional page to your website', price: 150, currency: 'USD', interval: 'one_time' },
                { name: 'Blog Setup', description: 'Full blog system with CMS integration', price: 300, currency: 'USD', interval: 'one_time' },
                { name: 'WhatsApp Chat Widget', description: 'Floating WhatsApp button for instant customer contact', price: 50, currency: 'USD', interval: 'one_time' },
            ],
            addons_id: [
                { name: 'Halaman Tambahan', description: 'Tambah satu halaman ekstra ke website Anda', price: 150, currency: 'USD', interval: 'one_time' },
                { name: 'Setup Blog', description: 'Sistem blog lengkap dengan integrasi CMS', price: 300, currency: 'USD', interval: 'one_time' },
                { name: 'Widget Chat WhatsApp', description: 'Tombol WhatsApp mengambang untuk kontak pelanggan instan', price: 50, currency: 'USD', interval: 'one_time' },
            ],
        },
        {
            title: 'E-Commerce Growth Plan',
            title_id: 'Paket Pertumbuhan E-Commerce',
            slug: 'e-commerce-growth-plan',
            description: 'Scale your online store with ongoing maintenance, priority support, and monthly performance optimizations.',
            description_id: 'Tingkatkan toko online Anda dengan pemeliharaan berkelanjutan, dukungan prioritas, dan optimasi performa bulanan.',
            price: 299,
            currency: 'USD',
            interval: 'monthly',
            features: ['Monthly Maintenance', 'Performance Tuning', 'Priority Support', 'Security Patches', 'Analytics Report'],
            features_id: ['Pemeliharaan Bulanan', 'Tuning Performa', 'Dukungan Prioritas', 'Patch Keamanan', 'Laporan Analitik'],
            addons: [
                { name: 'Advanced Analytics', description: 'Custom dashboard with conversion tracking and heatmaps', price: 79, currency: 'USD', interval: 'monthly' },
                { name: 'Multi-language Support', description: 'Internationalization setup for your store', price: 120, currency: 'USD', interval: 'one_time' },
                { name: 'Email Marketing Integration', description: 'Automated email campaigns connected to your store', price: 49, currency: 'USD', interval: 'monthly' },
            ],
            addons_id: [
                { name: 'Analitik Lanjutan', description: 'Dashboard kustom dengan pelacakan konversi dan heatmap', price: 79, currency: 'USD', interval: 'monthly' },
                { name: 'Dukungan Multi-bahasa', description: 'Setup internasionalisasi untuk toko Anda', price: 120, currency: 'USD', interval: 'one_time' },
                { name: 'Integrasi Email Marketing', description: 'Kampanye email otomatis terhubung ke toko Anda', price: 49, currency: 'USD', interval: 'monthly' },
            ],
        },
        {
            title: 'Enterprise Support (Annual)',
            title_id: 'Dukungan Enterprise (Tahunan)',
            slug: 'enterprise-support-annual',
            description: 'Full-service dedicated support for large organizations needing guaranteed uptime and rapid response.',
            description_id: 'Dukungan penuh khusus untuk organisasi besar yang membutuhkan jaminan uptime dan respons cepat.',
            price: 50000000,
            currency: 'IDR',
            interval: 'yearly',
            features: ['24/7 Dedicated Support', 'Rapid Response Time', 'Server Monitoring', 'Legal Compliance', 'Quarterly Reviews'],
            features_id: ['Dukungan Khusus 24/7', 'Waktu Respons Cepat', 'Pemantauan Server', 'Kepatuhan Hukum', 'Tinjauan Kuartalan'],
            addons: [
                { name: 'Disaster Recovery', description: 'Automated backup and disaster recovery plan', price: 15000000, currency: 'IDR', interval: 'yearly' },
                { name: 'Penetration Testing', description: 'Annual security audit and penetration test', price: 10000000, currency: 'IDR', interval: 'yearly' },
                { name: 'Custom SLA Upgrade', description: 'Upgrade to 99.99% uptime SLA with dedicated account manager', price: 20000000, currency: 'IDR', interval: 'yearly' },
            ],
            addons_id: [
                { name: 'Pemulihan Bencana', description: 'Backup otomatis dan rencana pemulihan bencana', price: 15000000, currency: 'IDR', interval: 'yearly' },
                { name: 'Pengujian Penetrasi', description: 'Audit keamanan tahunan dan uji penetrasi', price: 10000000, currency: 'IDR', interval: 'yearly' },
                { name: 'Upgrade SLA Kustom', description: 'Upgrade ke SLA uptime 99.99% dengan account manager khusus', price: 20000000, currency: 'IDR', interval: 'yearly' },
            ],
        },
        {
            title: 'Custom Website Design',
            title_id: 'Desain Website Kustom',
            slug: 'custom-website-design',
            description: 'High-end custom website design tailored to your brand identity and business goals.',
            description_id: 'Desain website kustom kelas atas yang disesuaikan dengan identitas merek dan tujuan bisnis Anda.',
            price: 25000000,
            currency: 'IDR',
            interval: 'one_time',
            features: ['Custom UI/UX Design', 'High Performance', 'Interactive Elements', 'Brand Integration', 'Source Files Included'],
            features_id: ['Desain UI/UX Kustom', 'Performa Tinggi', 'Elemen Interaktif', 'Integrasi Merek', 'Termasuk File Sumber'],
            addons: [
                { name: 'Motion & Animation Pack', description: 'Premium micro-animations and scroll-driven effects', price: 5000000, currency: 'IDR', interval: 'one_time' },
                { name: 'CMS Integration', description: 'Headless CMS setup for easy content management', price: 3500000, currency: 'IDR', interval: 'one_time' },
                { name: 'Logo & Branding Kit', description: 'Custom logo design with full brand guideline document', price: 7500000, currency: 'IDR', interval: 'one_time' },
            ],
            addons_id: [
                { name: 'Paket Motion & Animasi', description: 'Micro-animasi premium dan efek scroll-driven', price: 5000000, currency: 'IDR', interval: 'one_time' },
                { name: 'Integrasi CMS', description: 'Setup headless CMS untuk manajemen konten mudah', price: 3500000, currency: 'IDR', interval: 'one_time' },
                { name: 'Kit Logo & Branding', description: 'Desain logo kustom dengan dokumen panduan merek lengkap', price: 7500000, currency: 'IDR', interval: 'one_time' },
            ],
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
            const service = await prisma.service.update({
                where: { id: existing.id },
                data: {
                    slug: s.slug,
                    title_id: s.title_id,
                    description_id: s.description_id,
                    features: s.features,
                    features_id: s.features_id,
                    price: s.price,
                    currency: s.currency,
                    interval: s.interval,
                    addons: s.addons,
                    addons_id: s.addons_id,
                }
            });
            console.log(`Updated service: ${service.title}`);
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
