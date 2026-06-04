import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const isDev = process.env.NODE_ENV === 'development'

const globalForPrisma = globalThis as unknown as {
    prisma_v8: PrismaClient | undefined
    pg_pool_v8: Pool | undefined
    pg_adapter_v8: PrismaPg | undefined
}

const poolMax = process.env.DATABASE_POOL_SIZE
    ? parseInt(process.env.DATABASE_POOL_SIZE, 10)
    : (isDev ? 10 : 5); // Default 10 di dev, 5 di prod (optimal untuk standalone Docker VPS)

const pool = globalForPrisma.pg_pool_v8 ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: poolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Kegagalan lebih cepat jika DB down
    // Aktifkan SSL jika remote DB membutuhkannya (biasanya untuk Render/AWS/Neon dsb.)
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
        log: isDev ? ['error', 'warn'] : ['error'],
    })
}

export const prisma = globalForPrisma.prisma_v8 ?? prismaClientSingleton()

if (isDev) {
    globalForPrisma.prisma_v8 = prisma
}


