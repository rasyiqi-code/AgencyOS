/**
 * Script untuk generate ikon PWA dari logo utama.
 * Menghasilkan ikon dengan berbagai ukuran dan variant maskable.
 *
 * Penggunaan: bun run scripts/generate-pwa-icons.ts
 *
 * Dependencies: sharp (sudah ada di package.json)
 */

import sharp from "sharp";
import path from "path";
import fs from "fs";

// Konfigurasi ukuran ikon yang akan digenerate
const ICON_SIZES = [192, 384, 512] as const;

// Path sumber dan tujuan
const SOURCE_LOGO = path.join(process.cwd(), "public", "logo.png");
const OUTPUT_DIR = path.join(process.cwd(), "public", "icons");

/**
 * Generate ikon standar (tanpa padding tambahan).
 * Menggunakan background transparan dan resize fit cover.
 */
async function generateStandardIcon(size: number): Promise<void> {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp(SOURCE_LOGO)
        .resize(size, size, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

    console.log(`✅ Generated: icon-${size}x${size}.png`);
}

/**
 * Generate maskable icon dengan safe-zone padding.
 * Maskable icon membutuhkan ~10% padding di setiap sisi (total 20%)
 * agar konten inti tidak terpotong pada berbagai bentuk mask.
 * Background hitam sesuai dark theme aplikasi.
 */
async function generateMaskableIcon(size: number): Promise<void> {
    const outputPath = path.join(OUTPUT_DIR, `maskable-icon-${size}x${size}.png`);
    // Safe zone: 80% dari ukuran total
    const innerSize = Math.round(size * 0.8);

    // Resize logo ke ukuran inner, lalu compose di atas background hitam
    const resizedLogo = await sharp(SOURCE_LOGO)
        .resize(innerSize, innerSize, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 255 },
        },
    })
        .composite([
            {
                input: resizedLogo,
                gravity: "center",
            },
        ])
        .png()
        .toFile(outputPath);

    console.log(`✅ Generated: maskable-icon-${size}x${size}.png`);
}

async function main(): Promise<void> {
    // Validasi keberadaan logo sumber
    if (!fs.existsSync(SOURCE_LOGO)) {
        console.error(`❌ Logo sumber tidak ditemukan: ${SOURCE_LOGO}`);
        process.exit(1);
    }

    // Buat direktori output jika belum ada
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 Direktori dibuat: ${OUTPUT_DIR}`);
    }

    console.log("🎨 Memulai generate ikon PWA...\n");

    // Generate semua ikon standar
    for (const size of ICON_SIZES) {
        await generateStandardIcon(size);
    }

    // Generate maskable icon (hanya 512px)
    await generateMaskableIcon(512);

    console.log("\n🎉 Semua ikon PWA berhasil digenerate!");
}

main().catch((err) => {
    console.error("❌ Error saat generate ikon:", err);
    process.exit(1);
});
