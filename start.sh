#!/bin/sh
set -e

# Generate Prisma Client section removed (moved to Dockerfile build stage)
# echo "Generating Prisma Client..."
# bunx prisma generate

# Baseline: Tandai migrasi init sebagai sudah diterapkan
# (karena database production sudah punya tabel dari db push sebelumnya).
# Perintah ini aman dijalankan berulang — jika sudah di-resolve, akan diabaikan.
echo "Resolving baseline migration..."
bunx prisma migrate resolve --applied 0_init 2>/dev/null || true

# Jalankan migrasi yang belum diterapkan (production-safe)
echo "Running database migrations..."
bunx prisma migrate deploy

# Start the application
echo "Starting application..."
exec bun server.js
