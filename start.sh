#!/bin/sh
set -e

# Generate Prisma Client
echo "Generating Prisma Client..."
bunx prisma generate

# Run migrations
echo "Running database migrations..."
bunx prisma db push

# Start the application
echo "Starting application..."
exec bun server.js
