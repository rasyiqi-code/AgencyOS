import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
// Force type refresh - Added Promotion model

const connectionString = process.env.DATABASE_URL

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Crucial for serverless: 1 connection per lambda to avoid hitting global DB limits
    idleTimeoutMillis: 10000, // Release idle connections faster
    connectionTimeoutMillis: 15000, // Wait longer for a connection if pool is busy
})
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
})
const adapter = new PrismaPg(pool)

const prismaClientSingleton = () => {
    return new PrismaClient({ 
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma_v8: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma_v8 ?? prismaClientSingleton()

// Always store in globalThis to reuse connections across serverless warm starts
globalForPrisma.prisma_v8 = prisma


