import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";

// Singleton to avoid re-initializing
let s3Client: S3Client | null = null;
let s3BucketName: string | null = null;

async function getClient() {
    if (s3Client && s3BucketName) return { client: s3Client, bucketName: s3BucketName };

    const settings = await prisma.systemSetting.findMany({
        where: {
            key: { in: ['r2_endpoint', 'r2_access_key_id', 'r2_secret_access_key', 'r2_public_domain', 'r2_bucket_name'] }
        }
    });

    const getSetting = (key: string) => settings.find(s => s.key === key)?.value;

    const endpoint = getSetting('r2_endpoint');
    const accessKeyId = getSetting('r2_access_key_id');
    const secretAccessKey = getSetting('r2_secret_access_key');
    const bucketName = getSetting('r2_bucket_name') || "agency-os-assets"; // Fallback to avoid breaking if not set

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        throw new Error("Storage credentials not configured.");
    }

    s3Client = new S3Client({
        region: "auto",
        endpoint,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
    s3BucketName = bucketName;

    return { client: s3Client, bucketName };
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
        const domain = publicDomain.startsWith("http") ? publicDomain : `https://${publicDomain}`;
        return `${domain}/${path}`;
    } else {
        console.warn("R2 Public Domain not set in SystemSetting (key: r2_public_domain). Returning relative path.");
    }

    return path; // Fallback
}
