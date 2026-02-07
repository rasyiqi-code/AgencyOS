import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
// Force type refresh - Model Notification added
// Force type refresh - Squad Models added

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prismaClientSingleton = () => {
    return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma_v2: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma_v2 ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v2 = prisma
