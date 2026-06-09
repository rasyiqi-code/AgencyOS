#!/bin/bash
# Script migrasi import Next.js → alternatif non-Next.js
# Mengganti semua import statement secara massal

set -e

PROJECT_DIR="/media/rasyiqi/PROJECT/AgencyOS"
cd "$PROJECT_DIR"

echo "=== Phase 3: Migrasi Import ==="
echo ""

# --- 1. MIGRASI next-intl → custom hooks ---
echo "[1/7] Migrasi next-intl → @/lib/i18n/hooks..."

# Pattern: import { useTranslations } from "next-intl"
find components lib hooks types -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  's|from "next-intl"|from "@/lib/i18n/hooks"|g' 2>/dev/null || true

find components lib hooks types -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  "s|from 'next-intl'|from '@/lib/i18n/hooks'|g" 2>/dev/null || true

# Juga di src/ (jika ada)
find src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  's|from "next-intl"|from "@/lib/i18n/hooks"|g' 2>/dev/null || true

echo "   ✅ next-intl selesai"

# --- 2. MIGRASI next/link → hapus import, ganti <Link> → <a> ---
echo "[2/7] Migrasi next/link..."

# Hapus import Link from "next/link"
find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  '/^import Link from "next\/link"/d' 2>/dev/null || true

find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  "/^import Link from 'next\/link'/d" 2>/dev/null || true

# Ganti <Link href= → <a href=  dan </Link> → </a>
find components lib hooks types src -name "*.tsx" 2>/dev/null | xargs sed -i \
  's|<Link href=|<a href=|g' 2>/dev/null || true

find components lib hooks types src -name "*.tsx" 2>/dev/null | xargs sed -i \
  's|<Link |<a |g' 2>/dev/null || true

find components lib hooks types src -name "*.tsx" 2>/dev/null | xargs sed -i \
  's|</Link>|</a>|g' 2>/dev/null || true

echo "   ✅ next/link selesai"

# --- 3. MIGRASI next/image → hapus import, ganti <Image → <img ---
echo "[3/7] Migrasi next/image..."

# Hapus import Image from "next/image"
find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  '/^import Image from "next\/image"/d' 2>/dev/null || true

find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  "/^import Image from 'next\/image'/d" 2>/dev/null || true

# Ganti <Image → <img  (self-closing dan non-self-closing)
find components lib hooks types src -name "*.tsx" 2>/dev/null | xargs sed -i \
  's|<Image |<img |g' 2>/dev/null || true

echo "   ✅ next/image selesai"

# --- 4. MIGRASI next/cache → hapus import ---
echo "[4/7] Migrasi next/cache..."

find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  '/from "next\/cache"/d' 2>/dev/null || true

find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  "/from 'next\/cache'/d" 2>/dev/null || true

echo "   ✅ next/cache selesai"

# --- 5. MIGRASI next/dynamic → React lazy ---
echo "[5/7] Migrasi next/dynamic..."

find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  '/^import dynamic from "next\/dynamic"/d' 2>/dev/null || true

find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  "/^import dynamic from 'next\/dynamic'/d" 2>/dev/null || true

echo "   ✅ next/dynamic selesai"

# --- 6. MIGRASI next-themes → hardcode ---
echo "[6/7] Migrasi next-themes..."

# Di sonner.tsx: ganti useTheme import dan usage
find components -name "sonner.tsx" 2>/dev/null | xargs sed -i \
  '/import { useTheme } from "next-themes"/d' 2>/dev/null || true

find components -name "sonner.tsx" 2>/dev/null | xargs sed -i \
  's|const { theme = "system" } = useTheme()|const theme = "dark"|g' 2>/dev/null || true

echo "   ✅ next-themes selesai"

# --- 7. MIGRASI next/navigation → TanStack Router ---
echo "[7/7] Migrasi next/navigation (import saja, usage perlu manual fix)..."

# Pattern: import { useRouter } from "next/navigation"
# → import { useNavigate } from "@tanstack/react-router"
find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  's|import { useRouter } from "next/navigation"|import { useNavigate } from "@tanstack/react-router"|g' 2>/dev/null || true

find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  "s|import { useRouter } from 'next/navigation'|import { useNavigate } from '@tanstack/react-router'|g" 2>/dev/null || true

# Pattern: import { useRouter, useParams } → import { useNavigate, useParams }
find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  's|import { useRouter, useParams } from "next/navigation"|import { useNavigate, useParams } from "@tanstack/react-router"|g' 2>/dev/null || true

# Pattern: import { useSearchParams } → import { useSearch }  
find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  's|import { useSearchParams } from "next/navigation"|import { useSearch } from "@tanstack/react-router"|g' 2>/dev/null || true

# Pattern: import { useParams } alone
find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  's|import { useParams } from "next/navigation"|import { useParams } from "@tanstack/react-router"|g' 2>/dev/null || true

# Pattern: import { usePathname } → import { useLocation }
find components lib hooks types src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i \
  's|import { usePathname } from "next/navigation"|import { useLocation } from "@tanstack/react-router"|g' 2>/dev/null || true

echo "   ✅ next/navigation import selesai"

echo ""
echo "=== Migrasi import selesai! ==="
echo ""

# Verifikasi: cek sisa import next/ yang belum dimigrasi
echo "--- Sisa import next/ (perlu manual fix) ---"
grep -rn 'from "next/' --include="*.tsx" --include="*.ts" components/ lib/ hooks/ types/ src/ 2>/dev/null | grep -v node_modules | grep -v '.next' || echo "Tidak ada sisa!"

echo ""
echo "--- Sisa import next-intl ---"
grep -rn 'from "next-intl"' --include="*.tsx" --include="*.ts" components/ lib/ hooks/ types/ src/ 2>/dev/null | grep -v node_modules || echo "Tidak ada sisa!"

echo ""
echo "--- Sisa import next-themes ---"
grep -rn 'from "next-themes"' --include="*.tsx" --include="*.ts" components/ lib/ hooks/ types/ src/ 2>/dev/null | grep -v node_modules || echo "Tidak ada sisa!"
