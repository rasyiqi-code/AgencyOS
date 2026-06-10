import { createFileRoute } from '@tanstack/react-router'
import { hexclaveClientApp } from '@/lib/config/hexclave-client'
import { checkExistingAffiliateFn } from '@/src/server/affiliates'
import { redirect } from '@tanstack/react-router'
import { JoinAffiliateButton } from '@/components/marketing/join-affiliate-button'
import { DollarSign, BarChart3, Zap, Share2 } from 'lucide-react'

export const Route = createFileRoute('/affiliate/join')({
  beforeLoad: async () => {
    const user = await hexclaveClientApp.getUser()
    // Menggunakan href untuk rute dinamis /handler/sign-in
    if (!user) throw redirect({ href: '/handler/sign-in' })
  },
  loader: async () => {
    const res = await checkExistingAffiliateFn()
    // Mengarahkan ke rute index /affiliate/ jika profil sudah terdaftar
    if (res?.exists) throw redirect({ to: '/affiliate' })
  },
  component: AffiliateJoinPage,
})

const benefits = [
  { icon: DollarSign, title: 'Competitive Commission', desc: 'Earn up to 30% commission on every sale.' },
  { icon: BarChart3, title: 'Real-Time Tracking', desc: 'Monitor your clicks, conversions, and earnings.' },
  { icon: Zap, title: 'Instant Payouts', desc: 'Get paid automatically when you reach the threshold.' },
  { icon: Share2, title: 'Custom Links', desc: 'Unique tracking links for products and services.' },
]

function AffiliateJoinPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Join Our Affiliate Program</h1>
          <p className="text-zinc-400 mt-3 text-lg">
            Earn commissions by referring clients to AgencyOS
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12 text-left">
          {benefits.map((b, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <b.icon className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="font-semibold text-lg">{b.title}</h3>
              <p className="text-zinc-400 text-sm mt-1">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <JoinAffiliateButton />
          <p className="text-zinc-600 text-sm mt-4">
            By joining, you agree to our{' '}
            {/* Menggunakan tag anchor untuk halaman terms yang belum termigrasi sepenuhnya */}
            <a href="/terms" className="text-yellow-500 hover:underline">Terms & Conditions</a>
          </p>
        </div>
      </div>
    </div>
  )
}
