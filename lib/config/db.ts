import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
// Force type refresh - Added Promotion model

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
})
const adapter = new PrismaPg(pool)

const prismaClientSingleton = () => {
    return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma_v8: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma_v8 ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v8 = prisma


