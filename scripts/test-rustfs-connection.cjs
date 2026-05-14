const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    console.log("--- Testing RustFS Connection (Independent Script) ---");

    // 1. Get settings from DB
    const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
    await pgClient.connect();
    
    let settings = {};
    try {
        const res = await pgClient.query("SELECT key, value FROM \"SystemSetting\" WHERE key IN ('r2_endpoint', 'r2_access_key_id', 'r2_secret_access_key', 'r2_bucket_name')");
        res.rows.forEach(row => settings[row.key] = row.value);
    } finally {
        await pgClient.end();
    }

    const { r2_endpoint, r2_access_key_id, r2_secret_access_key, r2_bucket_name } = settings;

    console.log("Using settings:", {
        endpoint: r2_endpoint,
        accessKeyId: r2_access_key_id,
        bucket: r2_bucket_name
    });

    // 2. Initialize S3 Client
    const s3 = new S3Client({
        region: "auto",
        endpoint: r2_endpoint,
        credentials: {
            accessKeyId: r2_access_key_id,
            secretAccessKey: r2_secret_access_key,
        },
        forcePathStyle: true,
    });

    try {
        console.log("\n1. Testing ListObjectsV2...");
        const listRes = await s3.send(new ListObjectsV2Command({ Bucket: r2_bucket_name }));
        console.log(`✅ Success! Found ${listRes.Contents ? listRes.Contents.length : 0} objects.`);

        console.log("\n2. Testing PutObject...");
        const testKey = `test-connection-${Date.now()}.txt`;
        await s3.send(new PutObjectCommand({
            Bucket: r2_bucket_name,
            Key: testKey,
            Body: "Test content from independent script",
            ContentType: "text/plain"
        }));
        console.log(`✅ Success! Uploaded: ${testKey}`);

    } catch (err) {
        console.error("\n❌ Connection Test Failed!");
        console.error(err);
    }
}

testConnection();
