import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/config/db";

// Singleton to avoid re-initializing
let s3ClientInstance: S3Client | null = null;
let s3BucketName: string | null = null;
let s3ConfigHash: string | null = null;

export async function getClient() {
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: { in: ['r2_endpoint', 'r2_access_key_id', 'r2_secret_access_key', 'r2_public_domain', 'r2_bucket_name'] }
        }
    });

    const getSetting = (key: string) => settings.find(s => s.key === key)?.value;

    const endpoint = getSetting('r2_endpoint')?.trim();
    const accessKeyId = getSetting('r2_access_key_id')?.trim();
    const secretAccessKey = getSetting('r2_secret_access_key')?.trim();
    const bucketName = getSetting('r2_bucket_name')?.trim();

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
        throw new Error("Storage configuration is incomplete. Please set R2 Endpoint, Keys, and Bucket Name in Admin Settings.");
    }

    // Create a hash of the config to detect changes
    const configHash = JSON.stringify({ endpoint, accessKeyId, secretAccessKey, bucketName });

    if (s3ClientInstance && s3BucketName === bucketName && s3ConfigHash === configHash) {
        return { client: s3ClientInstance, bucketName: s3BucketName };
    }

    // Clean up endpoint: remove bucket name prefix if it exists (Cloudflare S3 API style)
    let cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
    if (cleanEndpoint.toLowerCase().startsWith(`${bucketName.toLowerCase()}.`)) {
        cleanEndpoint = cleanEndpoint.slice(bucketName.length + 1);
    }

    // Ensure protocol
    cleanEndpoint = `https://${cleanEndpoint}`;

    console.log("[Storage] Initializing R2 Client", {
        originalEndpoint: endpoint,
        cleanEndpoint,
        bucketName,
        accessKeyId: accessKeyId?.slice(0, 4) + '...' + accessKeyId?.slice(-4),
        secretLength: secretAccessKey?.length,
        forcePathStyle: true
    });

    s3ClientInstance = new S3Client({
        region: "auto",
        endpoint: cleanEndpoint,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
        forcePathStyle: true,
        // Optimization: Increase timeout for slower R2 responses
        requestHandler: {
            connectionTimeout: 10000, // 10s
            socketTimeout: 15000,     // 15s
        } as unknown as import("@smithy/types").RequestHandler<unknown, unknown>, // Intermediate cast to satisfy lint
    });
    s3BucketName = bucketName;
    s3ConfigHash = configHash;

    return { client: s3ClientInstance, bucketName };
}

/**
 * Retries a storage operation in case of transient errors (like ETIMEDOUT)
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || (error as { code?: string }).code === 'ETIMEDOUT');
            if (isTimeout) {
                console.warn(`[Storage] Timeout detected, retrying... (${retries} left)`);
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
    const { client, bucketName } = await getClient();

    let buffer: Buffer | Uint8Array;
    let finalContentType = contentType;

    if (fileOrBuffer instanceof File) {
        const arrayBuffer = await fileOrBuffer.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        if (!finalContentType) finalContentType = fileOrBuffer.type;
    } else {
        buffer = fileOrBuffer;
    }

    if (!finalContentType) {
        finalContentType = 'application/octet-stream';
    }

    return withRetry(async () => {
        await client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: path,
            Body: buffer,
            ContentType: finalContentType,
        }));

        const settings = await prisma.systemSetting.findUnique({ where: { key: 'r2_public_domain' } });
        const publicDomain = settings?.value;

        if (publicDomain) {
            let domain = publicDomain.trim();
            if (!domain.startsWith("http")) domain = `https://${domain}`;
            if (domain.endsWith("/")) domain = domain.slice(0, -1);
            const finalUrl = `${domain}/${path}`;
            console.log("R2 Upload Success. Public URL:", finalUrl);
            return finalUrl;
        } else {
            console.warn("R2 Public Domain not set (key: r2_public_domain). Falling back to internal proxy.");
            return `/api/storage/proxy?key=${path}`;
        }
    });
}

export async function listFiles(prefix?: string): Promise<Array<{ key: string; size: number; lastModified: Date; url: string }>> {
    const { client, bucketName } = await getClient();

    return withRetry(async () => {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix || '',
        });

        const response = await client.send(command);
        const files = (response.Contents || []).filter(item => item.Key && !item.Key.endsWith('/'));

        const settings = await prisma.systemSetting.findUnique({ where: { key: 'r2_public_domain' } });
        const publicDomain = settings?.value;

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
    const { client, bucketName } = await getClient();

    return withRetry(async () => {
        await client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        }));

        console.log("[Storage] Deleted file:", key);
    });
}
