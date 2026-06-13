import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSystemSettings } from "@/lib/server/settings";
import fs from "fs";
import path from "path";

// Singleton untuk menghindari inisialisasi ulang S3
let s3ClientInstance: S3Client | null = null;
let s3BucketName: string | null = null;
let s3ConfigHash: string | null = null;

// Direktori publik untuk penyimpanan file lokal
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Memeriksa apakah konfigurasi R2 lengkap dan siap digunakan.
 */
async function isR2Configured(): Promise<boolean> {
    try {
        const settings = await getSystemSettings(['r2_endpoint', 'r2_access_key_id', 'r2_secret_access_key', 'r2_bucket_name']);
        const getSetting = (key: string) => settings.find((s: { key: string, value: string }) => s.key === key)?.value?.trim();
        
        return !!(getSetting('r2_endpoint') && getSetting('r2_access_key_id') && getSetting('r2_secret_access_key') && getSetting('r2_bucket_name'));
    } catch {
        return false;
    }
}

/**
 * Mendapatkan provider storage yang aktif secara dinamis.
 * Membaca dari Edge Config jika tersedia, lalu ke env variable STORAGE_PROVIDER,
 * dan terakhir melakukan deteksi otomatis berdasarkan ketersediaan konfigurasi.
 */
async function getActiveProvider(): Promise<"vercel-blob" | "r2" | "local"> {
    // 1. Baca dari Vercel Edge Config jika tersedia secara realtime
    if (process.env.EDGE_CONFIG) {
        try {
            const { get } = await import("@vercel/edge-config");
            const edgeProvider = await get<string>("storageProvider");
            if (edgeProvider === "vercel-blob" || edgeProvider === "r2" || edgeProvider === "local") {
                return edgeProvider;
            }
        } catch (error) {
            console.warn("[Storage] Gagal membaca storageProvider dari Edge Config, menggunakan fallback lokal:", error);
        }
    }

    // 2. Baca dari environment variable local
    const provider = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
    if (provider === "vercel-blob") return "vercel-blob";
    if (provider === "r2") return "r2";
    if (provider === "local") return "local";

    // 3. Deteksi otomatis berdasarkan token & config yang tersedia
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (hasBlobToken) {
        return "vercel-blob";
    }

    if (await isR2Configured()) {
        return "r2";
    }

    return "local";
}

/**
 * Inisialisasi client S3 untuk Cloudflare R2
 */
export async function getClient() {
    const settings = await getSystemSettings(['r2_endpoint', 'r2_access_key_id', 'r2_secret_access_key', 'r2_public_domain', 'r2_bucket_name']);

    const getSetting = (key: string) => settings.find((s: { key: string, value: string }) => s.key === key)?.value;

    const endpoint = getSetting('r2_endpoint')?.trim();
    const accessKeyId = getSetting('r2_access_key_id')?.trim();
    const secretAccessKey = getSetting('r2_secret_access_key')?.trim();
    const bucketName = getSetting('r2_bucket_name')?.trim();

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
        throw new Error("Storage configuration is incomplete. Please set R2 Endpoint, Keys, and Bucket Name in Admin Settings.");
    }

    const configHash = JSON.stringify({ endpoint, accessKeyId, secretAccessKey, bucketName });

    if (s3ClientInstance && s3BucketName === bucketName && s3ConfigHash === configHash) {
        return { client: s3ClientInstance, bucketName: s3BucketName };
    }

    let cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
    if (cleanEndpoint.toLowerCase().startsWith(`${bucketName.toLowerCase()}.`)) {
        cleanEndpoint = cleanEndpoint.slice(bucketName.length + 1);
    }

    cleanEndpoint = `https://${cleanEndpoint}`;

    s3ClientInstance = new S3Client({
        region: "auto",
        endpoint: cleanEndpoint,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
        forcePathStyle: true,
        requestHandler: {
            connectionTimeout: 10000,
            socketTimeout: 15000,
        } as unknown as import("@smithy/types").RequestHandler<unknown, unknown>,
    });
    s3BucketName = bucketName;
    s3ConfigHash = configHash;

    return { client: s3ClientInstance, bucketName };
}

/**
 * Mengulang operasi storage jika terjadi kesalahan sementara
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || (error as { code?: string }).code === 'ETIMEDOUT');
            if (isTimeout) {
                console.warn(`[Storage] Timeout terdeteksi, mencoba kembali... (${retries} kali tersisa)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return withRetry(fn, retries - 1, delay * 2);
            }
        }
        throw error;
    }
}

async function uploadFileLocal(fileOrBuffer: File | Buffer | Uint8Array, relativePath: string): Promise<string> {
    const targetPath = path.join(LOCAL_UPLOAD_DIR, relativePath);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fileOrBuffer instanceof File) {
        const { pipeline } = await import("stream/promises");
        const { Readable } = await import("stream");
        
        const writeStream = fs.createWriteStream(targetPath);
        // Menggunakan stream.pipeline untuk performa streaming tinggi (zero double-buffering)
        await pipeline(
            Readable.from(fileOrBuffer.stream() as any),
            writeStream
        );
    } else {
        let data: Buffer;
        if (fileOrBuffer instanceof Buffer) {
            data = fileOrBuffer;
        } else {
            data = Buffer.from(fileOrBuffer);
        }
        await fs.promises.writeFile(targetPath, data);
    }

    return `/uploads/${relativePath}`;
}

/**
 * Membaca berkas lokal secara rekursif
 */
async function listFilesLocal(prefix?: string): Promise<Array<{ key: string; size: number; lastModified: Date; url: string }>> {
    const searchDir = prefix ? path.join(LOCAL_UPLOAD_DIR, prefix) : LOCAL_UPLOAD_DIR;
    if (!fs.existsSync(searchDir)) {
        return [];
    }

    const files: Array<{ key: string; size: number; lastModified: Date; url: string }> = [];

    async function walk(dir: string) {
        try {
            const list = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const item of list) {
                const fullPath = path.join(dir, item.name);
                const relPath = path.relative(LOCAL_UPLOAD_DIR, fullPath);

                if (item.isDirectory()) {
                    await walk(fullPath);
                } else {
                    const stat = await fs.promises.stat(fullPath);
                    files.push({
                        key: relPath,
                        size: stat.size,
                        lastModified: stat.mtime,
                        url: `/uploads/${relPath}`
                    });
                }
            }
        } catch (error) {
            console.error("[Storage Local] Gagal membaca direktori:", error);
        }
    }

    await walk(searchDir);
    return files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
}

/**
 * Menghapus file lokal
 */
async function deleteFileLocal(relativePath: string): Promise<void> {
    const targetPath = path.join(LOCAL_UPLOAD_DIR, relativePath);
    if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);
    }
}

export async function uploadFile(
    fileOrBuffer: File | Buffer | Uint8Array,
    pathName: string,
    contentType?: string
): Promise<string> {
    const provider = await getActiveProvider();

    // 1. Vercel Blob
    if (provider === "vercel-blob") {
        const { put } = await import("@vercel/blob");
        
        let finalContentType = contentType;
        if (fileOrBuffer instanceof File && !finalContentType) {
            finalContentType = fileOrBuffer.type;
        }
        
        let data: File | Buffer;
        if (fileOrBuffer instanceof File) {
            data = fileOrBuffer;
        } else if (fileOrBuffer instanceof Buffer) {
            data = fileOrBuffer;
        } else {
            data = Buffer.from(fileOrBuffer);
        }

        const blob = await put(pathName, data, {
            access: "public",
            contentType: finalContentType || "application/octet-stream",
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return blob.url;
    }

    // 2. Cloudflare R2
    if (provider === "r2" && await isR2Configured()) {
        const { client, bucketName } = await getClient();

        let body: ReadableStream<Uint8Array> | Buffer | Uint8Array;
        let finalContentType = contentType;

        if (fileOrBuffer instanceof File) {
            body = fileOrBuffer.stream();
            if (!finalContentType) finalContentType = fileOrBuffer.type;
        } else {
            body = fileOrBuffer;
        }

        if (!finalContentType) {
            finalContentType = 'application/octet-stream';
        }

        return withRetry(async () => {
            const parallelUpload = new Upload({
                client,
                params: {
                    Bucket: bucketName,
                    Key: pathName,
                    Body: body,
                    ContentType: finalContentType,
                },
            });

            await parallelUpload.done();

            const domainSettings = await getSystemSettings(["r2_public_domain"]);
            const publicDomain = domainSettings.find(s => s.key === "r2_public_domain")?.value;

            if (publicDomain) {
                let domain = publicDomain.trim();
                if (!domain.startsWith("http")) domain = `https://${domain}`;
                if (domain.endsWith("/")) domain = domain.slice(0, -1);
                return `${domain}/${pathName}`;
            } else {
                console.warn("R2 Public Domain not set (key: r2_public_domain). Falling back to internal proxy.");
                return `/api/storage/proxy?key=${pathName}`;
            }
        });
    }

    // 3. Fallback: Local File System
    console.info("[Storage] Provider aktif: Local. Menggunakan Local File System.");
    return await uploadFileLocal(fileOrBuffer, pathName);
}

export async function listFiles(prefix?: string): Promise<Array<{ key: string; size: number; lastModified: Date; url: string }>> {
    const provider = await getActiveProvider();

    // 1. Vercel Blob
    if (provider === "vercel-blob") {
        const { list } = await import("@vercel/blob");
        const response = await list({
            prefix: prefix || '',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        return response.blobs.map(blob => ({
            key: blob.pathname,
            size: blob.size,
            lastModified: new Date(blob.uploadedAt),
            url: blob.url
        })).sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    }

    // 2. Cloudflare R2
    if (provider === "r2" && await isR2Configured()) {
        const { client, bucketName } = await getClient();

        return withRetry(async () => {
            const command = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix || '',
            });

            const response = await client.send(command);
            const files = (response.Contents || []).filter(item => item.Key && !item.Key.endsWith('/'));

            const domainSettings = await getSystemSettings(["r2_public_domain"]);
            const publicDomain = domainSettings.find(s => s.key === "r2_public_domain")?.value;

            let domain = '';
            if (publicDomain) {
                domain = publicDomain.trim();
                if (!domain.startsWith("http")) domain = `https://${domain}`;
                if (domain.endsWith("/")) domain = domain.slice(0, -1);
            }

            return files.map(file => ({
                key: file.Key || '',
                size: file.Size || 0,
                lastModified: file.LastModified || new Date(),
                url: domain ? `${domain}/${file.Key}` : `/api/storage/proxy?key=${file.Key}`
            })).sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
        });
    }

    // 3. Fallback: Local File System
    console.info("[Storage] Provider aktif: Local. Membaca dari Local File System.");
    return await listFilesLocal(prefix);
}

export async function deleteFile(key: string): Promise<void> {
    const provider = await getActiveProvider();

    // 1. Vercel Blob
    if (provider === "vercel-blob") {
        const { del, list } = await import("@vercel/blob");

        let urlToDelete = key;

        if (!key.startsWith("http://") && !key.startsWith("https://")) {
            const response = await list({
                prefix: key,
                token: process.env.BLOB_READ_WRITE_TOKEN
            });
            const matchedBlob = response.blobs.find(blob => blob.pathname === key);
            if (matchedBlob) {
                urlToDelete = matchedBlob.url;
            } else if (response.blobs.length > 0) {
                urlToDelete = response.blobs[0].url;
            } else {
                console.warn(`[Storage] File dengan key ${key} tidak ditemukan di Vercel Blob.`);
                return;
            }
        }

        await del(urlToDelete, {
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        return;
    }

    // 2. Cloudflare R2
    if (provider === "r2" && await isR2Configured()) {
        const { client, bucketName } = await getClient();

        return withRetry(async () => {
            await client.send(new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            }));
        });
    }

    // 3. Fallback: Local File System
    console.info("[Storage] Provider aktif: Local. Menghapus dari Local File System.");
    await deleteFileLocal(key);
}
