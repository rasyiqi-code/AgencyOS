import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp, getCachedUsers } from '@/lib/config/hexclave'
import { isAdmin, canManageProjects } from '@/lib/shared/auth-helpers'
import { z } from 'zod'
import { slugify } from '@/lib/shared/utils'
import { Prisma } from '@prisma/client'

interface StackUser {
  id: string
  displayName: string | null
  primaryEmail: string | null
}

interface ProjectFile {
  name: string
  url: string
  type: string
  uploadedAt: string
}

// Validasi admin global atau hak akses PM
async function requirePM() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  const hasAccess = await canManageProjects()
  if (!hasAccess) throw new Error('Forbidden')
  return user
}

// Zod schema untuk update project (sama seperti action projects.ts lama)
const updateProjectSchema = z.object({
  projectId: z.string(),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    repoUrl: z.string().optional().nullable(),
    repoOwner: z.string().optional().nullable(),
    repoName: z.string().optional().nullable(),
    deployUrl: z.string().optional().nullable(),
    developerId: z.string().optional().nullable(),
    previewUrl: z.string().optional().nullable(),
    files: z.array(z.object({
      name: z.string(),
      url: z.string(),
      type: z.string(),
      uploadedAt: z.string()
    })).optional(),
    bounty: z.number().optional().nullable(),
  })
})

const updateProjectStatusSchema = z.object({
  projectId: z.string(),
  status: z.string()
})

const removeTeamMemberSchema = z.object({
  projectId: z.string(),
  squadId: z.string()
})

const deleteProjectFileSchema = z.object({
  projectId: z.string(),
  fileUrl: z.string()
})

// Schema untuk update & create service
const billingPeriodMap: Record<string, string> = {
  'monthly': 'every-month',
  'yearly': 'every-year',
  'one_time': 'once'
}

// 1. Mengambil daftar proyek (PM Registry)
export const getAdminProjectsFn = createServerFn({ method: 'GET' })
  .validator((data: { query?: string; status?: string }) => data)
  .handler(async ({ data }) => {
    await requirePM()

    const query = data.query?.trim() || undefined
    const status = data.status || 'all'
    const ITEMS_PER_PAGE = 10
    const skip = 0

    let matchedUserIds: string[] = []
    const isUUID = query && /^[0-9a-fA-F-]{36}$/.test(query)

    if (query) {
      if (isUUID) {
        matchedUserIds = [query]
      } else {
        try {
          const allUsers = await getCachedUsers() as unknown as StackUser[]
          matchedUserIds = (allUsers || [])
            .filter((u: StackUser) =>
              (u.displayName && u.displayName.toLowerCase().includes(query.toLowerCase())) ||
              (u.primaryEmail && u.primaryEmail.toLowerCase().includes(query.toLowerCase())) ||
              (u.id && u.id.toLowerCase().includes(query.toLowerCase()))
            )
            .map((u: StackUser) => u.id)
        } catch (e) {
          console.error("Search user resolution failed", e)
        }
      }
    }

    const where: Prisma.ProjectWhereInput = {
      AND: [
        { paymentStatus: "PAID" },
        query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { userId: { contains: query, mode: 'insensitive' } },
            { userId: { equals: query } },
            { description: { contains: query, mode: 'insensitive' } },
            { status: { contains: query, mode: 'insensitive' } },
            { service: { title: { contains: query, mode: 'insensitive' } } },
            ...(matchedUserIds.length > 0 ? [{ userId: { in: matchedUserIds } }] : []),
            { clientName: { contains: query, mode: 'insensitive' } },
            { invoiceId: { contains: query, mode: 'insensitive' } },
          ]
        } : {},
        (status && status !== 'all') ? { status: { equals: status } } : {},
      ]
    }

    const [totalProjects, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: ITEMS_PER_PAGE,
        skip,
        include: {
          service: true
        }
      })
    ])

    // Resolving client names
    const missingClientNameProjects = projects.filter((p) => (!p.clientName || p.clientName === "Client") && p.userId)
    const uniqueUserIds = Array.from(new Set(missingClientNameProjects.map(p => p.userId as string)))
    const stackUsers = await Promise.all(
      uniqueUserIds.map(async (id) => {
        try {
          return await hexclaveServerApp.getUser(id)
        } catch (e) {
          console.error(`Failed to fetch user ${id}`, e)
          return null
        }
      })
    )
    const userMap = new Map(stackUsers.filter(Boolean).map(u => [u!.id, u]))

    const enrichedProjects = projects.map((p) => {
      if (p.clientName && p.clientName !== "Client") return p
      const u = userMap.get(p.userId) as StackUser | undefined
      return {
        ...p,
        clientName: u?.displayName || u?.primaryEmail || "Unnamed Client"
      }
    })

    return {
      projects: enrichedProjects,
      totalCount: totalProjects
    }
  })

// 2. Mengambil detail proyek
export const getAdminProjectDetailFn = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requirePM()

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        service: true,
        estimate: true,
        briefs: true,
        feedback: {
          include: { comments: { orderBy: { createdAt: 'asc' } } }
        },
        dailyLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!project) throw new Error('Project not found')

    const teamApplications = await prisma.missionApplication.findMany({
      where: {
        missionId: project.id,
        status: { in: ['accepted', 'invited'] }
      },
      include: {
        squad: true
      }
    })

    const team = teamApplications.map(app => ({
      ...app.squad,
      applicationStatus: app.status
    }))

    return {
      project,
      team
    }
  })

// 3. Memperbarui Detail Proyek
export const updateProjectFn = createServerFn({ method: 'POST' })
  .validator(updateProjectSchema)
  .handler(async ({ data }) => {
    await requirePM()

    const { projectId, body } = data
    const { developerId, ...otherUpdates } = body

    const project = await prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id: projectId },
        data: otherUpdates as Prisma.ProjectUpdateInput,
      })

      if (developerId) {
        const squadProfile = await tx.squadProfile.findUnique({
          where: { userId: developerId }
        })

        if (squadProfile) {
          const existingApp = await tx.missionApplication.findFirst({
            where: {
              missionId: projectId,
              squadId: squadProfile.id
            }
          })

          if (!existingApp) {
            await tx.missionApplication.create({
              data: {
                missionId: projectId,
                squadId: squadProfile.id,
                status: "invited",
              }
            })

            await tx.notification.create({
              data: {
                userId: developerId,
                title: "New Mission Invitation",
                content: `You have been invited to join mission: ${updated.title || 'Untitled Project'}. Check your Squad Dashboard to accept.`,
                link: "/squad",
                type: "invitation"
              }
            })
          } else if (existingApp.status !== "accepted" && existingApp.status !== "invited") {
            await tx.missionApplication.update({
              where: { id: existingApp.id },
              data: { status: "invited" }
            })

            await tx.notification.create({
              data: {
                userId: developerId,
                title: "Mission Invitation Updated",
                content: `You have a pending invitation for mission: ${updated.title || 'Untitled Project'}.`,
                link: "/squad",
                type: "invitation"
              }
            })
          }
        }
      }

      return updated
    })

    return { success: true, data: project }
  })

// 4. Memperbarui Status Proyek
export const updateProjectStatusFn = createServerFn({ method: 'POST' })
  .validator(updateProjectStatusSchema)
  .handler(async ({ data }) => {
    await requirePM()

    const { projectId, status } = data
    const validStatuses = ["queue", "dev", "review", "done"]
    if (!validStatuses.includes(status)) throw new Error("Invalid status")

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status }
    })

    try {
      const stackUser = await hexclaveServerApp.getUser(project.userId)
      if (stackUser && stackUser.primaryEmail) {
        const { sendProjectStatusUpdateEmail } = await import("@/lib/email/client-notifications")
        sendProjectStatusUpdateEmail({
          to: stackUser.primaryEmail,
          customerName: stackUser.displayName || stackUser.primaryEmail.split('@')[0] || "Client",
          projectId: project.id,
          projectTitle: project.title,
          newStatus: status
        }).catch(err => console.error("Project status notification error:", err))
      }
    } catch (err) {
      console.error("Failed to fetch user for project status notification:", err)
    }

    return { success: true }
  })

// 5. Mengeluarkan Anggota Tim dari Proyek
export const removeTeamMemberFn = createServerFn({ method: 'POST' })
  .validator(removeTeamMemberSchema)
  .handler(async ({ data }) => {
    await requirePM()

    const { projectId, squadId } = data

    await prisma.$transaction(async (tx) => {
      await tx.missionApplication.delete({
        where: {
          missionId_squadId: {
            missionId: projectId,
            squadId: squadId
          }
        }
      })

      const squadProfile = await tx.squadProfile.findUnique({
        where: { id: squadId }
      })

      if (squadProfile) {
        const project = await tx.project.findUnique({
          where: { id: projectId },
          select: { developerId: true }
        })

        if (project?.developerId === squadProfile.userId) {
          await tx.project.update({
            where: { id: projectId },
            data: { developerId: null }
          })
        }
      }
    })

    return { success: true }
  })

// 6. Menghapus File Proyek
export const deleteProjectFileFn = createServerFn({ method: 'POST' })
  .validator(deleteProjectFileSchema)
  .handler(async ({ data }) => {
    await requirePM()

    const { projectId, fileUrl } = data

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { files: true }
    })

    const currentFiles = (project?.files as unknown as ProjectFile[]) || []
    const updatedFiles = currentFiles.filter((f) => f.url !== fileUrl)

    await prisma.project.update({
      where: { id: projectId },
      data: { files: updatedFiles as any }
    })

    return { success: true }
  })

// 7. Mengambil Katalog Layanan (Katalog Layanan PM)
export const getAdminServicesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requirePM()
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return services
  })

// 8. Menghapus Layanan
export const deleteAdminServiceFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: serviceId }) => {
    await requirePM()

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (service?.creemProductId) {
      try {
        const { creem } = await import("@/lib/integrations/creem")
        const sdk = await creem()
        await sdk.products.delete({ productId: service.creemProductId })
      } catch (e) {
        console.error("Failed to delete from Creem:", e)
      }
    }

    await prisma.service.delete({ where: { id: serviceId } })
    return { success: true }
  })

// 9. Mengunggah File Proyek
export const uploadProjectFileFn = createServerFn({ method: 'POST' })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    await requirePM()
    const projectId = data.get("projectId") as string
    const file = data.get("file") as File
    if (!file) throw new Error("No file provided")

    const { uploadFile } = await import("@/lib/integrations/storage")
    const filename = `projects/${projectId}/docs/${Date.now()}-${file.name.replace(/\s/g, "_")}`
    const url = await uploadFile(file, filename)

    if (!url || (!url.startsWith("http") && !url.startsWith("/"))) {
      throw new Error("Failed to upload to R2")
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { files: true }
    })

    const currentFiles = (project?.files as unknown as ProjectFile[]) || []
    const newFile = {
      name: file.name,
      url: url,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }
    const updatedFiles = [...currentFiles, newFile]

    await prisma.project.update({
      where: { id: projectId },
      data: { files: updatedFiles as any }
    })

    return { success: true, file: newFile }
  })

// 10. Mengunggah Gambar Pratinjau Proyek
export const uploadProjectPreviewFn = createServerFn({ method: 'POST' })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    await requirePM()
    const projectId = data.get("projectId") as string
    const file = data.get("file") as File
    if (!file) throw new Error("No file provided")

    const { uploadFile } = await import("@/lib/integrations/storage")
    const filename = `projects/${projectId}/preview/${Date.now()}-${file.name.replace(/\s/g, "_")}`
    const url = await uploadFile(file, filename)

    if (!url || (!url.startsWith("http") && !url.startsWith("/"))) {
      throw new Error("Failed to upload to R2")
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { previewUrl: url }
    })

    return { success: true, url }
  })

// 11. Membuat Daily Log Proyek
export const createDailyLogFn = createServerFn({ method: 'POST' })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const user = await hexclaveServerApp.getUser()
    if (!user) throw new Error("Unauthorized")

    const projectId = data.get("projectId") as string
    const isGlobalAdmin = await isAdmin()

    if (!isGlobalAdmin) {
      const squadProfile = await prisma.squadProfile.findUnique({
        where: { userId: user.id }
      })
      if (!squadProfile) throw new Error("Unauthorized")

      const application = await prisma.missionApplication.findUnique({
        where: {
          missionId_squadId: {
            missionId: projectId,
            squadId: squadProfile.id
          }
        }
      })

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { developerId: true }
      })

      const isAssigned = project?.developerId === squadProfile.id
      const isAccepted = application?.status === 'accepted'

      if (!isAssigned && !isAccepted) throw new Error("Unauthorized access to this mission")
    }

    const content = data.get("content") as string
    const mood = data.get("mood") as string
    const files = data.getAll("images") as File[]

    if (!content?.trim()) throw new Error("Content is required")
    const validMoods = ["on_track", "delayed", "shipped"]
    if (!validMoods.includes(mood)) throw new Error("Invalid mood")

    let uploadedUrls: string[] = []

    if (files && files.length > 0) {
      const { uploadFile } = await import("@/lib/integrations/storage")
      const uploadPromises = files.map(async (file, index) => {
        if (file.size > 0 && file.name !== 'undefined') {
          try {
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            const path = `projects/${projectId}/daily-updates/${Date.now()}-${index}-${safeName}`
            return await uploadFile(file, path)
          } catch (uploadError) {
            console.error("Failed to upload file:", file.name, uploadError)
            return null
          }
        }
        return null
      })

      const results = await Promise.all(uploadPromises)
      uploadedUrls = results.filter((url): url is string => url !== null)
    }

    const log = await prisma.dailyLog.create({
      data: {
        projectId,
        content,
        mood: mood as "on_track" | "delayed" | "shipped",
        images: uploadedUrls
      }
    })

    return { success: true, data: log }
  })

// 12. Membuat Layanan Baru
export const createAdminServiceFn = createServerFn({ method: 'POST' })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    await requirePM()

    const action = data.get("action")
    if (action === 'sync') {
      return { success: true, count: 0, warning: "Import checks skipped: API limitation" }
    }

    const title = data.get("title")?.toString()
    const title_id = data.get("title_id")?.toString()
    const description = data.get("description")?.toString()
    const description_id = data.get("description_id")?.toString()
    const priceRaw = data.get("price")?.toString()
    const currency = data.get("currency")?.toString() || "USD"
    const interval = data.get("interval")?.toString() || "one_time"
    const featuresRaw = data.get("features")?.toString() || ""
    const featuresIdRaw = data.get("features_id")?.toString() || ""
    const imageFile = data.get("image") as File
    const slugInput = data.get("slug")?.toString()

    if (!title || !description || !title_id || !description_id || !priceRaw) {
      throw new Error("Missing required fields")
    }

    const price = parseFloat(priceRaw)
    if (isNaN(price)) throw new Error("Invalid price format")

    const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '')
    const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '')

    let imageUrl: string | null = null
    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
      try {
        const { uploadFile } = await import("@/lib/integrations/storage")
        imageUrl = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`)
      } catch (storageError) {
        console.error("Storage upload failed:", storageError)
      }
    }

    let creemProductId: string | null = null
    try {
      const { creem } = await import("@/lib/integrations/creem")
      const sdk = await creem()
      const creemProduct = await sdk.products.create({
        name: title,
        description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
        price: Math.round(price * 100),
        currency: currency,
        billingType: interval === 'one_time' ? 'onetime' : 'recurring',
        billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "once" | "every-month" | "every-year",
        taxMode: "inclusive",
        taxCategory: "digital-goods-service",
        imageUrl: imageUrl || undefined
      })
      creemProductId = creemProduct.id
    } catch (error) {
      console.error("Failed to create Creem product (Proceeding anyway):", error)
    }

    const service = await prisma.service.create({
      data: {
        title,
        title_id,
        description,
        description_id,
        price,
        priceType: data.get("priceType")?.toString() || "FIXED",
        currency,
        interval,
        category: data.get("category")?.toString() || "Uncategorized",
        visibility: data.get("visibility")?.toString() || "PUBLIC",
        features,
        features_id,
        addons: (() => {
          try {
            const val = data.get("addons")
            return val ? JSON.parse(val.toString()) : []
          } catch {
            return []
          }
        })(),
        addons_id: (() => {
          try {
            const val = data.get("addons_id")
            return val ? JSON.parse(val.toString()) : []
          } catch {
            return []
          }
        })(),
        image: imageUrl,
        creemProductId,
        slug: slugInput ? slugify(slugInput) : slugify(title)
      } as Prisma.ServiceCreateInput
    })

    return { success: true, data: service }
  })

// 13. Memperbarui Layanan
export const updateAdminServiceFn = createServerFn({ method: 'POST' })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    await requirePM()

    const serviceId = data.get("serviceId")?.toString()
    if (!serviceId) throw new Error("Service ID is required")

    const title = data.get("title")?.toString()
    const title_id = data.get("title_id")?.toString()
    const description = data.get("description")?.toString()
    const description_id = data.get("description_id")?.toString()
    const priceRaw = data.get("price")?.toString()
    const priceType = data.get("priceType")?.toString() || "FIXED"
    const currency = data.get("currency")?.toString() || "USD"
    const interval = data.get("interval")?.toString() || "one_time"
    const featuresRaw = data.get("features")?.toString() || ""
    const featuresIdRaw = data.get("features_id")?.toString() || ""
    const imageFile = data.get("image") as File
    const imageUrlInput = data.get("image_url")?.toString()
    const slugInput = data.get("slug")?.toString()
    const category = data.get("category")?.toString() || "Uncategorized"

    if (!title || !description || !title_id || !description_id || !priceRaw) {
      throw new Error("Missing required fields")
    }

    const price = parseFloat(priceRaw)
    if (isNaN(price)) throw new Error("Invalid price format")

    const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '')
    const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '')

    const addonsRaw = data.get("addons")?.toString()
    const addonsIdRaw = data.get("addons_id")?.toString()

    const updateData: Record<string, unknown> = {
      title,
      title_id,
      description,
      description_id,
      price,
      priceType,
      currency,
      interval,
      category,
      visibility: data.get("visibility")?.toString() || "PUBLIC",
      features,
      features_id,
      addons: (() => {
        try {
          return addonsRaw ? JSON.parse(addonsRaw) : []
        } catch {
          return []
        }
      })(),
      addons_id: (() => {
        try {
          return addonsIdRaw ? JSON.parse(addonsIdRaw) : []
        } catch {
          return []
        }
      })(),
      slug: slugInput ? slugify(slugInput) : slugify(title)
    }

    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
      try {
        const { uploadFile } = await import("@/lib/integrations/storage")
        updateData.image = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`)
      } catch (storageError) {
        console.error("Storage upload failed during update:", storageError)
      }
    } else if (imageUrlInput) {
      updateData.image = imageUrlInput
    }

    try {
      const { creem } = await import("@/lib/integrations/creem")
      const sdk = await creem()
      const existingService = await prisma.service.findUnique({ where: { id: serviceId } })

      if (existingService?.creemProductId) {
        try {
          await sdk.products.update({
            productId: existingService.creemProductId,
            name: title,
            description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
            price: Math.round(price * 100),
            billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "once" | "every-month" | "every-year",
            imageUrl: (updateData.image as string) || undefined
          })
        } catch (innerError) {
          const errorObj = innerError as { status?: number; message?: string }
          if (errorObj?.status === 404) {
            const newProduct = await sdk.products.create({
              name: title,
              description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
              price: Math.round(price * 100),
              currency: currency,
              billingType: interval === 'one_time' ? 'onetime' : 'recurring',
              billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "once" | "every-month" | "every-year",
              taxMode: "inclusive",
              taxCategory: "digital-goods-service",
              imageUrl: (updateData.image as string) || undefined
            })
            updateData.creemProductId = newProduct.id
          } else {
            throw innerError
          }
        }
      } else {
        const creemProduct = await sdk.products.create({
          name: title,
          description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
          price: Math.round(price * 100),
          currency: currency,
          billingType: interval === 'one_time' ? 'onetime' : 'recurring',
          billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "once" | "every-month" | "every-year",
          taxMode: "inclusive",
          taxCategory: "digital-goods-service",
          imageUrl: (updateData.image as string) || undefined
        })
        updateData.creemProductId = creemProduct.id
      }
    } catch (e) {
      console.error("Creem sync failed during update:", e)
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: updateData as Prisma.ServiceUpdateInput
    })

    return { success: true, data: updated }
  })

