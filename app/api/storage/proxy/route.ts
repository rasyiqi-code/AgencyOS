
import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";

// Helper to get S3 Client (Duplicated logic from lib/storage temporarily or we should export it)
// Ideally we refactor lib/storage to export this.
async function getClient() {
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: { in: ['r2_endpoint', 'r2_access_key_id', 'r2_secret_access_key', 'r2_bucket_name'] }
        }
    });

    const getSetting = (key: string) => settings.find(s => s.key === key)?.value;

    const endpoint = getSetting('r2_endpoint');
    const accessKeyId = getSetting('r2_access_key_id');
    const secretAccessKey = getSetting('r2_secret_access_key');
    const bucketName = getSetting('r2_bucket_name') || "agency-os-assets";

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        return null;
    }

    const client = new S3Client({
        region: "auto",
        endpoint,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    return { client, bucketName };
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
        return new NextResponse("Missing key", { status: 400 });
    }

    try {
        const s3 = await getClient();
        if (!s3) {
            return new NextResponse("Storage not configured", { status: 500 });
        }

        const command = new GetObjectCommand({
            Bucket: s3.bucketName,
            Key: key,
        });

        const response = await s3.client.send(command);

        if (!response.Body) {
            return new NextResponse("File not found", { status: 404 });
        }

        // Convert stream to Web Response
        const stream = response.Body.transformToWebStream();

        return new NextResponse(stream, {
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });

    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Failed to fetch image", { status: 500 });
    }
}
