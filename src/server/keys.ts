import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { randomBytes } from 'crypto'
import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/googleai'
import { z } from 'zod'

// Helper untuk validasi admin
async function requireAdmin() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Forbidden')
  return user
}

// 1. Mengambil kunci agensi
export const getAgencyKeysFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    return await prisma.systemKey.findMany({
      where: { provider: "agency-os" },
      orderBy: { createdAt: "desc" }
    })
  })

// 2. Membuat kunci agensi baru
export const createAgencyKeyFn = createServerFn({ method: 'POST' })
  .validator((label: string) => label)
  .handler(async ({ data: label }) => {
    await requireAdmin()
    const key = `gos_${randomBytes(32).toString('hex')}`
    const newKey = await prisma.systemKey.create({
      data: {
        key,
        provider: "agency-os",
        label,
        isActive: true
      }
    })
    return newKey
  })

// 3. Mengaktifkan/menonaktifkan kunci agensi
export const toggleAgencyKeyFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string; isActive: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    await prisma.systemKey.update({
      where: { id: data.id },
      data: { isActive: data.isActive }
    })
    return { success: true }
  })

// 4. Menghapus kunci agensi
export const deleteAgencyKeyFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await prisma.systemKey.delete({
      where: { id }
    })
    return { success: true }
  })

const verifyGoogleKeySchema = z.object({
  key: z.string(),
  label: z.string().optional(),
  modelId: z.string().optional()
})

// 5. Memverifikasi dan menyimpan kunci Google Gemini
export const verifyAndSaveGoogleKeyFn = createServerFn({ method: 'POST' })
  .validator(verifyGoogleKeySchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const { key, label, modelId } = data
    const targetModel = modelId || "gemini-1.5-flash"
    try {
      const tempAI = genkit({
        plugins: [googleAI({ apiKey: key })],
        model: `googleai/${targetModel}`,
      })
      await tempAI.generate("Hi")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error tidak diketahui"
      throw new Error(`Verification Failed: ${message}`)
    }

    await prisma.systemKey.updateMany({
      where: { provider: "google" },
      data: { isActive: false },
    })

    const result = await prisma.systemKey.upsert({
      where: { key },
      update: {
        label: label || "Unnamed Key",
        modelId: modelId || null,
        isActive: true,
      },
      create: {
        key,
        label: label || "Unnamed Key",
        provider: "google",
        modelId: modelId || null,
        isActive: true,
      },
    })
    return result
  })

// 6. Fungsi publik untuk memeriksa status konfigurasi kunci Google Gemini
export const getGoogleKeyStatusFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const key = await prisma.systemKey.findFirst({
      where: { provider: "google", isActive: true }
    })
    return { configured: !!key }
  })

