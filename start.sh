#!/bin/sh
set -e

# Generate Prisma Client section removed (moved to Dockerfile build stage)
# echo "Generating Prisma Client..."
# bunx prisma generate

# =============================================
# DEBUG: Verifikasi environment variables
# =============================================
echo "Loading config. DB URL exists? $([ -n "$DATABASE_URL" ] && echo true || echo false)"
echo "Stack Auth Project ID exists? $([ -n "$NEXT_PUBLIC_STACK_PROJECT_ID" ] && echo true || echo false)"
echo "Stack Auth Client Key exists? $([ -n "$NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY" ] && echo true || echo false)"
echo "Stack Auth Server Key exists? $([ -n "$STACK_SECRET_SERVER_KEY" ] && echo true || echo false)"
echo "App URL: ${NEXT_PUBLIC_APP_URL:-NOT SET}"

# DEBUG: Tampilkan 8 karakter pertama project ID (masked) untuk verifikasi
if [ -n "$NEXT_PUBLIC_STACK_PROJECT_ID" ]; then
    MASKED=$(echo "$NEXT_PUBLIC_STACK_PROJECT_ID" | cut -c1-8)
    echo "Stack Auth Project ID (masked): ${MASKED}..."
fi

# DEBUG: Test konektivitas ke Stack Auth API
echo "Testing Stack Auth API connectivity..."
if command -v curl > /dev/null 2>&1; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -H "x-stack-project-id: $NEXT_PUBLIC_STACK_PROJECT_ID" \
        -H "x-stack-publishable-client-key: $NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY" \
        -H "x-stack-access-type: client" \
        "https://api.stack-auth.com/api/v1/users/me" 2>/dev/null || echo "FAILED")
    echo "Stack Auth API response code: $HTTP_CODE"
    if [ "$HTTP_CODE" = "400" ]; then
        echo "Stack Auth API: OK (400 = auth required, API is reachable)"
    elif [ "$HTTP_CODE" = "404" ]; then
        echo "WARNING: Stack Auth API returned 404! Project ID may be invalid."
    elif [ "$HTTP_CODE" = "FAILED" ]; then
        echo "WARNING: Cannot reach Stack Auth API. Network issue?"
    fi
else
    echo "curl not available, skipping connectivity test"
fi
echo "==========================================="

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

