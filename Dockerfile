# Base image: Node 20 (Alpine)
FROM node:20-alpine AS base
# Install libraries required for Bun to run on Alpine
RUN apk add --no-cache libc6-compat

# Stage 1: Install dependencies using Bun
FROM base AS deps
WORKDIR /app

# Install Bun via npm (easiest way to get matching binary)
RUN npm install -g bun

COPY package.json bun.lock ./
# Install dependencies using Bun (Fast & respects lockfile)
RUN bun install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY start.sh ./start.sh

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# 1. Generate Prisma Client (Use Bun runtime, it worked previously)
RUN npx bunx prisma generate

# 2. Build Next.js (Use Node runtime to avoid SIGILL crash)
RUN npm run build

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set permission for nextjs cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy start script
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["./start.sh"]
