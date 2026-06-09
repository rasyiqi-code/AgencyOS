import { prisma } from '@/lib/config/db'

/**
 * Memeriksa apakah konfigurasi Google AI (Gemini) sudah aktif di database.
 * Fungsi ini digunakan di halaman admin untuk menampilkan peringatan sistem.
 */
export async function isAIConfigured(): Promise<boolean> {
  try {
    const key = await prisma.systemKey.findFirst({
      where: { isActive: true, provider: 'google' }
    })
    return !!key
  } catch (error) {
    console.error('[IS_AI_CONFIGURED_ERROR]', error)
    return false
  }
}

/**
 * Mengambil konfigurasi API Key dan model Google AI yang aktif.
 */
export async function getActiveAIConfig() {
  const key = await prisma.systemKey.findFirst({
    where: { isActive: true, provider: 'google' }
  })

  if (!key) throw new Error("AI belum dikonfigurasi di sistem.")

  return {
    apiKey: key.key,
    model: key.modelId || 'gemini-1.5-flash'
  }
}
