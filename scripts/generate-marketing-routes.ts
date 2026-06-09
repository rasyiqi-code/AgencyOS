import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Direktori target rute TanStack Start
const TARGET_DIR = join(process.cwd(), 'src/routes');

// Definisi rute pemasaran yang akan dibuat
const routes = [
  {
    path: 'admin.marketing.index.tsx',
    content: `import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/marketing/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/marketing/promotions' })
  }
})
`
  },
  {
    path: 'admin.marketing.affiliates.tsx',
    componentName: 'AffiliateManager',
    importPath: '@/components/admin/marketing/affiliate-manager',
    routePath: '/admin/marketing/affiliates',
    title: 'Affiliate Partners',
    subtitle: 'Manage registered affiliate partners, commission rates, and tracking links.'
  },
  {
    path: 'admin.marketing.payouts.tsx',
    componentName: 'PayoutRequests',
    importPath: '@/components/admin/marketing/payout-requests',
    routePath: '/admin/marketing/payouts',
    title: 'Payout Requests',
    subtitle: 'Process commission payout requests for affiliate partners and squad members.'
  },
  {
    path: 'admin.marketing.coupons.tsx',
    componentName: 'CouponsManager',
    importPath: '@/components/admin/marketing/coupons-manager',
    routePath: '/admin/marketing/coupons',
    title: 'Coupons & Discounts',
    subtitle: 'Create and manage discount codes for promotional campaigns.'
  },
  {
    path: 'admin.marketing.subscribers.tsx',
    componentName: 'SubscribersManager',
    importPath: '@/components/admin/marketing/subscribers-manager',
    routePath: '/admin/marketing/subscribers',
    title: 'Newsletter Subscribers',
    subtitle: 'Manage mailing list subscriptions and readers.'
  },
  {
    path: 'admin.marketing.assets.tsx',
    componentName: 'AssetsManager',
    importPath: '@/components/admin/marketing/assets-manager',
    routePath: '/admin/marketing/assets',
    title: 'Marketing Assets',
    subtitle: 'Manage banners, copy, and promotional assets for affiliate partners.'
  },
  {
    path: 'admin.marketing.promotions.tsx',
    componentName: 'PromotionsManager',
    importPath: '@/components/admin/marketing/promotions-manager',
    routePath: '/admin/marketing/promotions',
    title: 'Campaign Promotions',
    subtitle: 'Create and schedule marketing promotions and discount campaigns.'
  },
  {
    path: 'admin.marketing.bonuses.tsx',
    componentName: 'BonusesManager',
    importPath: '@/components/admin/marketing/bonuses-manager',
    routePath: '/admin/marketing/bonuses',
    title: 'Customer Bonuses',
    subtitle: 'Manage special bonuses and freebies bundled with specific services.'
  },
  {
    path: 'admin.marketing.leads.tsx',
    componentName: 'LeadsManager',
    importPath: '@/components/admin/marketing/leads-manager',
    routePath: '/admin/marketing/leads',
    title: 'Generated Leads',
    subtitle: 'View and manage potential customer contact information captured.'
  },
  {
    path: 'admin.marketing.popups.tsx',
    componentName: 'PopUpsManager',
    importPath: '@/components/admin/marketing/popups-manager',
    routePath: '/admin/marketing/popups',
    title: 'Conversion Pop-ups',
    subtitle: 'Design and manage pop-ups to drive leads and sales.'
  },
  {
    path: 'admin.marketing.push.tsx',
    componentName: 'PushManager',
    importPath: '@/components/admin/marketing/push-manager',
    routePath: '/admin/marketing/push',
    title: 'Push Notification Center',
    subtitle: 'Broadcast web push notifications to registered subscribers.'
  }
];

// Pastikan direktori target ada
if (!existsSync(TARGET_DIR)) {
  mkdirSync(TARGET_DIR, { recursive: true });
}

// Generate setiap berkas rute
for (const route of routes) {
  const filePath = join(TARGET_DIR, route.path);
  
  if (route.content) {
    writeFileSync(filePath, route.content, 'utf-8');
    console.log(`[GENERATED] ${route.path}`);
    continue;
  }

  const generatedContent = `import { createFileRoute } from '@tanstack/react-router'
import { ${route.componentName} } from '${route.importPath}'
import { Users } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute('${route.routePath}')({
  component: ${route.componentName}Route,
})

function ${route.componentName}Route() {
  return (
    <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-yellow" />
          ${route.title}
        </h1>
        <p className="text-zinc-400 mt-1">
          ${route.subtitle}
        </p>
      </header>

      <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Content...</div>}>
          <${route.componentName} />
        </Suspense>
      </div>
    </div>
  )
}
`;

  writeFileSync(filePath, generatedContent, 'utf-8');
  console.log(`[GENERATED] ${route.path}`);
}

console.log('Semua kerangka rute pemasaran berhasil dibuat!');
