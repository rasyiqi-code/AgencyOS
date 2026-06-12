import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSystemSettings } from "@/lib/server/settings";

// Singleton untuk menghindari inisialisasi ulang S3
let s3ClientInstance: S3Client | null = null;
let s3BucketName: string | null = null;
let s3ConfigHash: string | null = null;

/**
 * Memeriksa apakah provider Vercel Blob aktif berdasarkan environment variable.
 */
function isVercelBlobActive(): boolean {
    const provider = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

    // Jika provider diset ke vercel-blob secara eksplisit dan token ada
    if (provider === "vercel-blob" && token) {
        return true;
    }
    // Jika provider diset ke r2 secara eksplisit, paksa pakai R2
    if (provider === "r2") {
        return false;
    }
    // Jika provider tidak ditentukan, fallback otomatis ke Vercel Blob jika token ada
    if (!provider && token) {
        return true;
    }

    return false;
}

export async function getClient() {
    // ⚡ Bolt Optimization: Gunakan getSystemSettings (yang memanfaatkan unstable_cache) dibanding prisma query langsung.
    // 🎯 Kenapa: Mengurangi load database dengan mencache konfigurasi storage yang sering diakses.
    // 📊 Dampak: Mengeliminasi database query saat inisialisasi client storage.
    const settings = await getSystemSettings(['r2_endpoint', 'r2_access_key_id', 'r2_secret_access_key', 'r2_public_domain', 'r2_bucket_name']);

    const getSetting = (key: string) => settings.find((s: { key: string, value: string }) => s.key === key)?.value;

    const endpoint = getSetting('r2_endpoint')?.trim();
    const accessKeyId = getSetting('r2_access_key_id')?.trim();
    const secretAccessKey = getSetting('r2_secret_access_key')?.trim();
    const bucketName = getSetting('r2_bucket_name')?.trim();

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
        throw new Error("Storage configuration is incomplete. Please set R2 Endpoint, Keys, and Bucket Name in Admin Settings.");
    }

    // Buat hash konfigurasi untuk mendeteksi perubahan
    const configHash = JSON.stringify({ endpoint, accessKeyId, secretAccessKey, bucketName });

    if (s3ClientInstance && s3BucketName === bucketName && s3ConfigHash === configHash) {
        return { client: s3ClientInstance, bucketName: s3BucketName };
    }

    // Bersihkan endpoint: hapus prefix bucket name jika ada (Cloudflare S3 API style)
    let cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
    if (cleanEndpoint.toLowerCase().startsWith(`${bucketName.toLowerCase()}.`)) {
        cleanEndpoint = cleanEndpoint.slice(bucketName.length + 1);
    }

    // Pastikan menggunakan protokol https
    cleanEndpoint = `https://${cleanEndpoint}`;

    s3ClientInstance = new S3Client({
        region: "auto",
        endpoint: cleanEndpoint,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
        forcePathStyle: true,
        // Optimasi: Tingkatkan timeout untuk respon R2 yang lebih lambat
        requestHandler: {
            connectionTimeout: 10000, // 10s
            socketTimeout: 15000,     // 15s
        } as unknown as import("@smithy/types").RequestHandler<unknown, unknown>, // Intermediate cast untuk memuaskan linter
    });
    s3BucketName = bucketName;
    s3ConfigHash = configHash;

    return { client: s3ClientInstance, bucketName };
}

/**
 * Mengulang operasi storage jika terjadi kesalahan sementara (seperti ETIMEDOUT)
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

export async function uploadFile(
    fileOrBuffer: File | Buffer | Uint8Array,
    path: string,
    contentType?: string
): Promise<string> {
    // Jalankan Vercel Blob jika aktif
    if (isVercelBlobActive()) {
        const { put } = await import("@vercel/blob");
        
        let finalContentType = contentType;
        if (fileOrBuffer instanceof File && !finalContentType) {
            finalContentType = fileOrBuffer.type;
        }
        
        // Vercel Blob put menerima File, Buffer, atau Stream secara native
        let data: File | Buffer;
        if (fileOrBuffer instanceof File) {
            data = fileOrBuffer;
        } else if (fileOrBuffer instanceof Buffer) {
            data = fileOrBuffer;
        } else {
            data = Buffer.from(fileOrBuffer);
        }

        const blob = await put(path, data, {
            access: "public",
            contentType: finalContentType || "application/octet-stream",
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return blob.url;
    }

    // Fallback ke Cloudflare R2
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
        // OPTIMASI C5: Menggunakan @aws-sdk/lib-storage untuk mengalirkan berkas secara paralel/stream langsung
        const parallelUpload = new Upload({
            client,
            params: {
                Bucket: bucketName,
                Key: path,
                Body: body,
                ContentType: finalContentType,
            },
        });

        await parallelUpload.done();

        // ⚡ Optimasi: Gunakan getSystemSettings yang ter-cache (TTL 1 jam)
        // untuk menghindari query DB langsung setiap kali upload file
        const domainSettings = await getSystemSettings(["r2_public_domain"]);
        const publicDomain = domainSettings.find(s => s.key === "r2_public_domain")?.value;

        if (publicDomain) {
            let domain = publicDomain.trim();
            if (!domain.startsWith("http")) domain = `https://${domain}`;
            if (domain.endsWith("/")) domain = domain.slice(0, -1);
            const finalUrl = `${domain}/${path}`;

            return finalUrl;
        } else {
            console.warn("R2 Public Domain not set (key: r2_public_domain). Falling back to internal proxy.");
            return `/api/storage/proxy?key=${path}`;
        }
    });
}

export async function listFiles(prefix?: string): Promise<Array<{ key: string; size: number; lastModified: Date; url: string }>> {
    // Jalankan Vercel Blob jika aktif
    if (isVercelBlobActive()) {
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

    // Fallback ke Cloudflare R2
    const { client, bucketName } = await getClient();

    return withRetry(async () => {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix || '',
        });

        const response = await client.send(command);
        const files = (response.Contents || []).filter(item => item.Key && !item.Key.endsWith('/'));

        // ⚡ Optimasi: Gunakan getSystemSettings yang ter-cache (TTL 1 jam)
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

export async function deleteFile(key: string): Promise<void> {
    // Jalankan Vercel Blob jika aktif
    if (isVercelBlobActive()) {
        const { del, list } = await import("@vercel/blob");

        let urlToDelete = key;

        // Jika key bukan URL penuh (tidak dimulai dengan http:// atau https://),
        // cari file tersebut menggunakan list() untuk menemukan URL aslinya
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

    // Fallback ke Cloudflare R2
    const { client, bucketName } = await getClient();

    return withRetry(async () => {
        await client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        }));
    });
}
