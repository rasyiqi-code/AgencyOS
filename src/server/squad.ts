import { createServerFn } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { prisma } from '@/lib/config/db'

export const getSquadData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await hexclaveServerApp.getUser()
    if (!user) return null

    const profile = await prisma.squadProfile.findUnique({
      where: { userId: user.id },
      include: {
        applications: {
          where: {
            OR: [
              { status: 'accepted' },
              { status: 'invited' },
            ],
          },
          include: {
            mission: {
              include: {
                estimate: true,
              },
            },
          },
        },
      },
    })

    const availableMissions = await prisma.project.findMany({
      where: { status: 'queue' },
      orderBy: { createdAt: 'desc' },
      include: { estimate: true },
    })

    return {
      profile: profile
        ? {
            ...profile,
            applications: profile.applications.map(a => ({
              ...a,
              createdAt: a.createdAt.toISOString(),
              mission: a.mission
                ? {
                    ...a.mission,
                    createdAt: a.mission.createdAt.toISOString(),
                    estimate: a.mission.estimate
                      ? { ...a.mission.estimate, createdAt: a.mission.estimate.createdAt.toISOString() }
                      : null,
                  }
                : null,
            })),
          }
        : null,
      availableMissions: availableMissions.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        estimate: m.estimate
          ? { ...m.estimate, createdAt: m.estimate.createdAt.toISOString() }
          : null,
      })),
    }
  },
)

export const getSquadActiveMissions = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await hexclaveServerApp.getUser()
    if (!user) return null

    const squadProfile = await prisma.squadProfile.findUnique({
      where: { userId: user.id },
    })
    if (!squadProfile) return null

    const applications = await prisma.missionApplication.findMany({
      where: {
        squadId: squadProfile.id,
        status: 'accepted',
      },
      include: {
        mission: {
          include: {
            briefs: true,
            service: true,
            estimate: true,
            dailyLogs: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            feedback: {
              where: { status: 'open' },
            },
          },
        },
      },
    })

    return applications.map(app => ({
      ...app,
      createdAt: app.createdAt.toISOString(),
      mission: app.mission
        ? {
            ...app.mission,
            createdAt: app.mission.createdAt.toISOString(),
            updatedAt: app.mission.updatedAt.toISOString(),
            dailyLogs: app.mission.dailyLogs.map(dl => ({
              ...dl,
              createdAt: dl.createdAt.toISOString(),
            })),
            feedback: app.mission.feedback.map(fb => ({
              ...fb,
              createdAt: fb.createdAt.toISOString(),
            })),
          }
        : null,
    }))
  },
)
