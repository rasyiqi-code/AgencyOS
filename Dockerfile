FROM oven/bun:1 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY start.sh ./start.sh

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Stack Auth variables required for build time static generation
ARG NEXT_PUBLIC_STACK_PROJECT_ID
ARG NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
ARG STACK_SECRET_SERVER_KEY
ENV NEXT_PUBLIC_STACK_PROJECT_ID=$NEXT_PUBLIC_STACK_PROJECT_ID
ENV NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=$NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
ENV STACK_SECRET_SERVER_KEY=$STACK_SECRET_SERVER_KEY

# Dummy URL required for prisma generate (build time only)
ENV DATABASE_URL="postgresql://postgres:password@localhost:5432/agency_os"

RUN bunx prisma generate
RUN bun run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install Prisma globally for migrations
RUN npm install -g prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

COPY --from=builder /app/start.sh ./start.sh

CMD ["./start.sh"]
