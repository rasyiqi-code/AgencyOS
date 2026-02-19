#!/bin/sh
set -e

# Generate Prisma Client section removed (moved to Dockerfile build stage)
# echo "Generating Prisma Client..."
# bunx prisma generate

# Run migrations
echo "Running database migrations..."
bunx prisma db push --accept-data-loss

# Start the application
echo "Starting application..."
exec bun server.js
