# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app
# Install dependencies required for some packages
RUN apk add --no-cache libc6-compat

COPY package.json ./
# Jika ada lockfile lain, copy juga (misal yarn.lock atau package-lock.json jika nanti ada)
# Saat ini kita pakai npm install biasa karena bun.lock tidak bisa dibaca npm
RUN npm install

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Copy start script
COPY start.sh ./start.sh

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Stage 3: Production runner
FROM node:18-alpine AS runner
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
