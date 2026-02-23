#!/bin/sh
set -e

# Generate Prisma Client section removed (moved to Dockerfile build stage)
# echo "Generating Prisma Client..."
# bunx prisma generate

# Sinkronisasi database menggunakan db push (lebih rapi untuk 1 file schema)
# Ini akan menjaga data tetap ada selama tidak ada perubahan yang menghapus kolom/tabel.
echo "Pushing database schema..."
bunx prisma db push

# Start the application
echo "Starting application..."
exec bun server.js
