import { createServerFn } from '@tanstack/react-start'

// Server function untuk mengambil pengaturan sistem dengan input array key pengaturan
export const getSystemSettings = createServerFn({ method: 'GET' })
  .validator((data: string[]) => data)
  .handler(async ({ data }) => {
    const { getSystemSettings: getSystemSettingsImpl } = await import('@/lib/server/settings')
    return getSystemSettingsImpl(data)
  })

// Server function untuk mengambil testimonial aktif berdasarkan jumlah limit
export const getActiveTestimonials = createServerFn({ method: 'GET' })
  .validator((data: number) => data)
  .handler(async ({ data }) => {
    const { getActiveTestimonials: getActiveTestimonialsImpl } = await import(
      '@/lib/server/testimonials'
    )
    return getActiveTestimonialsImpl(data)
  })

// Server function untuk mengambil nama affiliate berdasarkan kode affiliate
export const getAffiliateName = createServerFn({ method: 'GET' })
  .validator((data: string) => data)
  .handler(async ({ data }) => {
    const { getAffiliateName: getAffiliateNameImpl } = await import('@/lib/server/affiliates')
    return getAffiliateNameImpl(data)
  })

// Server function untuk mengambil data user yang terautentikasi (dibuat serializable)
export const getUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { hexclaveServerApp } = await import('@/lib/config/hexclave')
    const user = await hexclaveServerApp.getUser()
    if (!user) return null
    // Mengembalikan objek polos (plain object) agar serializable melewati server function boundary
    return {
      id: user.id,
      displayName: user.displayName || undefined,
      primaryEmail: user.primaryEmail || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
    }
  })
