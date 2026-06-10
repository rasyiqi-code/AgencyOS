import dotenv from "dotenv";
import path from "path";

// Pemuatan variabel lingkungan hanya dilakukan di lingkungan server-side (Node.js/Bun)
if (typeof window === "undefined") {
  // Dapatkan path root proyek secara absolut dari lokasi file ini
  const rootDir = path.resolve(import.meta.dirname, "../../");
  const envLocalPath = path.resolve(rootDir, ".env.local");
  const envPath = path.resolve(rootDir, ".env");

  // Muat berkas .env
  const resEnv = dotenv.config({ path: envPath });
  if (resEnv.parsed) {
    for (const [key, val] of Object.entries(resEnv.parsed)) {
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    }
  }

  // Muat berkas .env.local (memiliki prioritas lebih tinggi untuk development lokal)
  const resLocal = dotenv.config({ path: envLocalPath });
  if (resLocal.parsed) {
    for (const [key, val] of Object.entries(resLocal.parsed)) {
      process.env[key] = val;
    }
  }

  // Petakan STACK_SECRET_SERVER_KEY ke HEXCLAVE_SECRET_SERVER_KEY jika belum terdefinisi
  if (process.env.STACK_SECRET_SERVER_KEY && !process.env.HEXCLAVE_SECRET_SERVER_KEY) {
    process.env.HEXCLAVE_SECRET_SERVER_KEY = process.env.STACK_SECRET_SERVER_KEY;
  }
}
