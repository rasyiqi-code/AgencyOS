import { join } from "path";
import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";

const PROJECT_DIR = "/media/rasyiqi/PROJECT/AgencyOS";

function getFiles(dir: string): string[] {
    let results: string[] = [];
    const list = readdirSync(dir);
    list.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== "node_modules" && file !== ".next" && file !== "backup" && file !== ".git" && file !== "scripts") {
                results = results.concat(getFiles(filePath));
            }
        } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
            results.push(filePath);
        }
    });
    return results;
}

function processFile(filePath: string) {
    if (filePath.endsWith("next-navigation-shim.ts") || filePath.endsWith("next-cache-shim.ts") || filePath.endsWith("next-dynamic-shim.ts")) {
        return;
    }

    let content = readFileSync(filePath, "utf8");
    let changed = false;

    // 1. Ubah <Image menjadi <img
    if (content.includes("<Image") || content.includes("</Image>")) {
        content = content.replace(/<Image(\s|[\r\n])/g, "<img$1");
        content = content.replace(/<\/Image>/g, "</img>");
        changed = true;
    }

    // 2. Bersihkan atribut Next Image dari tag <img> yang baru
    if (content.includes("<img")) {
        const original = content;
        content = content.replace(/<img([^>]*?)>/g, (match, p1) => {
            let attrs = p1;
            attrs = attrs.replace(/\bfill\b/g, "");
            attrs = attrs.replace(/\bunoptimized\s*=\s*\{[^}]*\}/g, "");
            attrs = attrs.replace(/\bunoptimized\b/g, "");
            attrs = attrs.replace(/\bpriority\s*=\s*\{[^}]*\}/g, "");
            attrs = attrs.replace(/\bpriority\b/g, "");
            attrs = attrs.replace(/\bquality\s*=\s*\{[^}]*\}/g, "");
            attrs = attrs.replace(/\bquality\s*=\s*["'][^"']*["']/g, "");
            return `<img${attrs}>`;
        });
        if (content !== original) {
            changed = true;
        }
    }

    // 3. Ubah <style jsx> dan <style jsx global> menjadi <style>
    if (content.includes("<style jsx") || content.includes("<style jsx global>")) {
        content = content.replace(/<style\s+jsx[^>]*>/g, "<style>");
        changed = true;
    }

    // 4. Periksa penggunaan useRouter, usePathname, useSearchParams
    const hasUseRouter = /\buseRouter\b/.test(content);
    const hasUsePathname = /\busePathname\b/.test(content);
    const hasUseSearchParams = /\buseSearchParams\b/.test(content);

    if (hasUseRouter || hasUsePathname || hasUseSearchParams) {
        // Hapus impor useRouter dari @tanstack/react-router jika ada untuk menghindari konflik tipe
        const tanstackImportRegex = /import\s*\{([^}]*)\}\s*from\s*["']@tanstack\/react-router["']/g;
        if (tanstackImportRegex.test(content)) {
            content = content.replace(tanstackImportRegex, (match, p1) => {
                const imports = p1.split(",").map((x: string) => x.trim());
                const filtered = imports.filter((x: string) => x !== "useRouter");
                if (filtered.length === 0) {
                    return "";
                }
                return `import { ${filtered.join(", ")} } from "@tanstack/react-router"`;
            });
        }

        const neededNav: string[] = [];
        if (hasUseRouter) neededNav.push("useRouter");
        if (hasUsePathname) neededNav.push("usePathname");
        if (hasUseSearchParams) neededNav.push("useSearchParams");

        const navShimRegex = /import\s*\{([^}]*)\}\s*from\s*["']@\/src\/lib\/next-navigation-shim["'];?/g;
        if (navShimRegex.test(content)) {
            // Update impor yang sudah ada
            content = content.replace(navShimRegex, (match, p1) => {
                const existing = p1.split(",").map((x: string) => x.trim()).filter(Boolean);
                const combined = Array.from(new Set([...existing, ...neededNav]));
                return `import { ${combined.join(", ")} } from "@/src/lib/next-navigation-shim";`;
            });
            changed = true;
        } else {
            // Tambahkan impor baru
            const importLine = `import { ${neededNav.join(", ")} } from "@/src/lib/next-navigation-shim";\n`;
            if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
                const lines = content.split("\n");
                lines.splice(1, 0, importLine);
                content = lines.join("\n");
            } else {
                content = importLine + content;
            }
            changed = true;
        }
    }

    // 5. Periksa penggunaan revalidatePath dan revalidateTag
    const hasRevalidatePath = /\brevalidatePath\b/.test(content);
    const hasRevalidateTag = /\brevalidateTag\b/.test(content);

    if (hasRevalidatePath || hasRevalidateTag) {
        const neededCache: string[] = [];
        if (hasRevalidatePath) neededCache.push("revalidatePath");
        if (hasRevalidateTag) neededCache.push("revalidateTag");

        const cacheShimRegex = /import\s*\{([^}]*)\}\s*from\s*["']@\/src\/lib\/next-cache-shim["'];?/g;
        if (cacheShimRegex.test(content)) {
            // Update impor yang sudah ada
            content = content.replace(cacheShimRegex, (match, p1) => {
                const existing = p1.split(",").map((x: string) => x.trim()).filter(Boolean);
                const combined = Array.from(new Set([...existing, ...neededCache]));
                return `import { ${combined.join(", ")} } from "@/src/lib/next-cache-shim";`;
            });
            changed = true;
        } else {
            // Tambahkan impor baru
            const importLine = `import { ${neededCache.join(", ")} } from "@/src/lib/next-cache-shim";\n`;
            if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
                const lines = content.split("\n");
                lines.splice(1, 0, importLine);
                content = lines.join("\n");
            } else {
                content = importLine + content;
            }
            changed = true;
        }
    }

    // 5b. Periksa penggunaan dynamic
    const hasDynamic = /\bdynamic\b/.test(content);
    if (hasDynamic) {
        const hasDynamicShimImport = content.includes("next-dynamic-shim");
        if (!hasDynamicShimImport) {
            const importLine = `import dynamic from "@/src/lib/next-dynamic-shim";\n`;
            if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
                const lines = content.split("\n");
                lines.splice(1, 0, importLine);
                content = lines.join("\n");
            } else {
                content = importLine + content;
            }
            changed = true;
        }
    }

    // 6. Bersihkan `next: { revalidate: ... }` dari pemanggilan fetch
    if (content.includes("revalidate") && content.includes("next")) {
        const original = content;
        content = content.replace(/\bnext\s*:\s*\{\s*revalidate\s*:\s*\d+\s*\},?/g, "");
        if (content !== original) {
            changed = true;
        }
    }

    // 7. Perbaikan dinamis khusus di chat-message.tsx jika ditemui
    if (filePath.endsWith("chat-message.tsx") && content.includes("const ReactMarkdown = dynamic")) {
        content = content.replace(
            /const ReactMarkdown = dynamic\(\(\) => import\('react-markdown'\),\s*\{\s*ssr:\s*false\s*\}\);/g,
            "import ReactMarkdown from 'react-markdown';"
        );
        changed = true;
    }

    if (changed) {
        writeFileSync(filePath, content, "utf8");
        console.log(`Updated: ${filePath.replace(PROJECT_DIR, "")}`);
    }
}

function run() {
    console.log("Scanning files for import fixes...");
    const files = getFiles(PROJECT_DIR);
    console.log(`Found ${files.length} TS/TSX files.`);
    files.forEach(processFile);
    console.log("Import fixes completed.");
}

run();
