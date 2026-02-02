#!/bin/sh
set -e

# Run migrations
echo "Running database migrations..."
bunx prisma migrate deploy

# Start the application
echo "Starting application..."
exec bun server.js
