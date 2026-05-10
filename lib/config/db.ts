import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const isDev = process.env.NODE_ENV === 'development'

const globalForPrisma = globalThis as unknown as {
    prisma_v8: PrismaClient | undefined
    pg_pool_v8: Pool | undefined
    pg_adapter_v8: PrismaPg | undefined
}

const pool = globalForPrisma.pg_pool_v8 ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: isDev ? 10 : 1, // Use more connections in dev, keep 1 for serverless prod
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Faster failure if DB is down
    // Enable SSL if your remote DB requires it (common for Render/AWS/etc)
    // ssl: { rejectUnauthorized: false }
})

if (isDev) {
    globalForPrisma.pg_pool_v8 = pool
}

const adapter = globalForPrisma.pg_adapter_v8 ?? new PrismaPg(pool)

if (isDev) {
    globalForPrisma.pg_adapter_v8 = adapter
}

const prismaClientSingleton = () => {
    return new PrismaClient({ 
        adapter,
        log: isDev ? ['query', 'error', 'warn'] : ['error'],
    })
}

export const prisma = globalForPrisma.prisma_v8 ?? prismaClientSingleton()

if (isDev) {
    globalForPrisma.prisma_v8 = prisma
}


