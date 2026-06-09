/**
 * Script migrasi: Hapus semua Next.js shim dan ganti dengan modul router/hooks.ts
 * 
 * Pola migrasi:
 * 1. next-navigation-shim → @/lib/router/hooks
 * 2. next-cache-shim → hapus import + hapus pemanggilan revalidatePath/revalidateTag
 */
import { readdir, readFile, writeFile, stat } from "fs/promises";
import { join, extname } from "path";

const ROOT = "/media/rasyiqi/PROJECT/AgencyOS";
const DIRS_TO_SCAN = ["components", "lib", "hooks", "src", "tests"];

// Regex patterns
const NAV_SHIM_IMPORT = /import\s*\{([^}]+)\}\s*from\s*["']@\/src\/lib\/next-navigation-shim["'];?\n?/g;
const CACHE_SHIM_IMPORT = /import\s*\{([^}]+)\}\s*from\s*["']@\/src\/lib\/next-cache-shim["'];?\n?/g;

// Counter
let totalFixed = 0;
let navFixed = 0;
let cacheFixed = 0;

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "backup") continue;
        files.push(...await getAllFiles(fullPath));
      } else if ([".ts", ".tsx"].includes(extname(entry.name))) {
        files.push(fullPath);
      }
    }
  } catch { /* ignore */ }
  return files;
}

function processNavImport(content: string): string {
  return content.replace(NAV_SHIM_IMPORT, (_match, imports: string) => {
    const names = imports.split(",").map((s: string) => s.trim()).filter(Boolean);
    // Semua fungsi yang ada di shim sekarang di-re-export dari @/lib/router/hooks
    return `import { ${names.join(", ")} } from "@/lib/router/hooks";\n`;
  });
}

function processCacheImport(content: string): string {
  // Hapus import cache shim (semua fungsi di dalamnya adalah noop)
  return content.replace(CACHE_SHIM_IMPORT, () => {
    return "// revalidatePath/revalidateTag tidak diperlukan di TanStack Start\n";
  });
}

// Hapus panggilan revalidatePath(...) dan revalidateTag(...) yang sudah noop
function removeCacheCalls(content: string): string {
  // Hapus statement standalone: revalidatePath("..."); atau revalidateTag("...");
  content = content.replace(/^\s*revalidatePath\([^)]*\);?\s*\n?/gm, "");
  content = content.replace(/^\s*revalidateTag\([^)]*\);?\s*\n?/gm, "");
  return content;
}

async function processFile(filePath: string) {
  const content = await readFile(filePath, "utf-8");
  let newContent = content;
  let changed = false;

  // Migrasi navigation shim
  if (newContent.includes("next-navigation-shim")) {
    newContent = processNavImport(newContent);
    if (newContent !== content) {
      navFixed++;
      changed = true;
    }
  }

  // Migrasi cache shim
  if (newContent.includes("next-cache-shim")) {
    newContent = processCacheImport(newContent);
    newContent = removeCacheCalls(newContent);
    if (newContent !== content) {
      cacheFixed++;
      changed = true;
    }
  }

  if (changed) {
    await writeFile(filePath, newContent, "utf-8");
    totalFixed++;
    console.log(`✅ ${filePath.replace(ROOT + "/", "")}`);
  }
}

async function main() {
  console.log("🔄 Memulai migrasi shim → router/hooks...\n");

  for (const dir of DIRS_TO_SCAN) {
    const fullDir = join(ROOT, dir);
    const files = await getAllFiles(fullDir);
    for (const file of files) {
      await processFile(file);
    }
  }

  console.log(`\n📊 Hasil:`);
  console.log(`   Navigation shim: ${navFixed} file`);
  console.log(`   Cache shim: ${cacheFixed} file`);
  console.log(`   Total: ${totalFixed} file diperbarui`);
}

main().catch(console.error);
