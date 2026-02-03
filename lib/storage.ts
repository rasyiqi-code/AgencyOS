import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";

// Singleton to avoid re-initializing
let s3ClientInstance: S3Client | null = null;
let s3BucketName: string | null = null;
let s3ConfigHash: string | null = null;

async function getClient() {
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
        forcePathStyle: true, // Reverting to path-style
        // logger: console, 
    });
    s3BucketName = bucketName;
    s3ConfigHash = configHash;

    return { client: s3ClientInstance, bucketName };
}

export async function uploadFile(file: File, path: string): Promise<string> {
    const { client, bucketName } = await getClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: path,
        Body: buffer,
        ContentType: file.type,
    }));

    // Return the public URL
    // We need to know the public domain. For now, we'll try to use the one provided or construct it?
    // User provided: https://pub-8444e4b7ff014377afa695d532f922cd.r2.dev
    // We should also store this in SystemSetting.
    console.log("Starting R2 Upload for:", path);
    // console.log("Current Bucket:", bucketName);

    const settings = await prisma.systemSetting.findUnique({ where: { key: 'r2_public_domain' } });
    const publicDomain = settings?.value;

    if (publicDomain) {
        let domain = publicDomain.trim();
        if (!domain.startsWith("http")) domain = `https://${domain}`;
        // Remove trailing slash if exists
        if (domain.endsWith("/")) domain = domain.slice(0, -1);

        const finalUrl = `${domain}/${path}`;
        console.log("R2 Upload Success. Public URL:", finalUrl);
        return finalUrl;
    } else {
        console.warn("R2 Public Domain not set (key: r2_public_domain). Falling back to internal proxy.");
        return `/api/storage/proxy?key=${path}`;
    }
}

export async function listFiles(prefix?: string): Promise<Array<{ key: string; size: number; lastModified: Date; url: string }>> {
    const { client, bucketName } = await getClient();

    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix || '',
    });

    const response = await client.send(command);
    // List only objects, filter out folders (keys ending in /)
    const files = (response.Contents || []).filter(item => item.Key && !item.Key.endsWith('/'));

    // Get public domain for URL construction
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
}

export async function deleteFile(key: string): Promise<void> {
    const { client, bucketName } = await getClient();

    await client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    }));

    console.log("[Storage] Deleted file:", key);
}
