import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { getSystemSettings, getPageSeoFn } from '@/src/server/settings'

type SystemSetting = {
  key: string
  value: string
}

const loader = async () => {
  const settings = await getSystemSettings({ data: ['AGENCY_NAME', 'COMPANY_NAME'] })
  const pageSeo = await getPageSeoFn({ data: '/privacy' })
  return { settings, pageSeo }
}

export const Route = createFileRoute('/privacy')({
  loader,
  head: ({ loaderData }) => {
    const pageSeo = loaderData?.pageSeo
    const title = pageSeo?.title || 'Kebijakan Privasi'
    const description = pageSeo?.description || 'Kebijakan Privasi platform AgencyOS.'
    const ogImage = pageSeo?.ogImage || undefined
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
      ],
    }
  },
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  const { settings } = useLoaderData({ from: Route.id })
  const agencyName = settings?.find((s: SystemSetting) => s.key === 'AGENCY_NAME')?.value || 'AgencyOS'
  const companyName = settings?.find((s: SystemSetting) => s.key === 'COMPANY_NAME')?.value || 'AgencyOS'

  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 p-8 md:p-24 font-sans leading-relaxed pt-28">
        <div className="max-w-4xl mx-auto space-y-12">
          <header className="space-y-4 border-b border-white/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Kebijakan Privasi</h1>
            <p className="text-zinc-500">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </header>

          <div className="space-y-8 text-base md:text-lg">
            <p>
              Selamat datang di **{agencyName}** (&quot;Kami&quot;, &quot;Platform&quot; atau &quot;{companyName}&quot;). Kami menghargai privasi Anda dan berkomitmen untuk melindungi informasi pribadi yang Anda bagikan kepada kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan menjaga informasi Anda saat Anda menggunakan situs web dan layanan kami.
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Informasi yang Kami Kumpulkan</h2>
              <ul className="list-disc pl-6 space-y-2 marker:text-brand-yellow">
                <li>
                  <strong className="text-white">Informasi Akun:</strong> Nama, alamat email, foto profil, dan kredensial login yang Anda gunakan untuk mendaftar.
                </li>
                <li>
                  <strong className="text-white">Data Pembayaran:</strong> Riwayat transaksi, faktur (Invoice), dan status pembayaran. Kami <em>tidak</em> menyimpan detail kartu kredit lengkap Anda; pemrosesan pembayaran ditangani oleh pihak ketiga (Midtrans/Creem).
                </li>
                <li>
                  <strong className="text-white">Data Proyek:</strong> Brief, file aset, pesan support, dan log aktivitas proyek yang Anda unggah atau buat di dalam platform.
                </li>
                <li>
                  <strong className="text-white">Informasi Teknis:</strong> Alamat IP, jenis browser, data log, dan cookie untuk sesi login dan keamanan.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Cara Kami Menggunakan Informasi Anda</h2>
              <p>Kami menggunakan data Anda untuk:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-brand-yellow">
                <li>Menyediakan, mengoperasikan, dan memelihara layanan {agencyName}.</li>
                <li>Memproses transaksi pembayaran dan mengirimkan konfirmasi/faktur.</li>
                <li>Berkomunikasi dengan Anda terkait update proyek, layanan pelanggan, atau perubahan kebijakan.</li>
                <li>Mendeteksi dan mencegah penipuan atau akses tidak sah.</li>
                <li>Mengintegrasikan layanan pihak ketiga (seperti notifikasi GitHub/Vercel) sesuai izin Anda.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Keamanan Data</h2>
              <p>
                Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang dirancang untuk melindungi keamanan informasi pribadi apa pun yang kami proses. Namun, perlu ingat bahwa transmisi internet tidak pernah 100% aman.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Hak Anda</h2>
              <p>
                Anda berhak untuk mengakses, memperbarui, atau menghapus informasi pribadi Anda kapan saja secara langsung melalui menu pengaturan di platform kami atau dengan menghubungi support.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Hubungi Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang kebijakan ini, silakan hubungi tim support kami melalui fitur Chat di dashboard.
              </p>
            </section>
          </div>

          <footer className="pt-12 border-t border-white/10 text-sm text-zinc-500 flex justify-between">
            <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          </footer>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
