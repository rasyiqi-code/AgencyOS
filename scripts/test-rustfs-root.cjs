const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

async function testRoot() {
    console.log("--- Testing RustFS Root Connection ---");

    const s3 = new S3Client({
        region: "auto",
        endpoint: "https://file.crediblemark.com",
        credentials: {
            accessKeyId: "rustfsadmin",
            secretAccessKey: "iwlqovp8fnt2ldbn",
        },
        forcePathStyle: true,
    });

    try {
        console.log("Testing ListObjectsV2 with Root...");
        const listRes = await s3.send(new ListObjectsV2Command({ Bucket: "crediblemark" }));
        console.log(`✅ Success! Root found ${listRes.Contents ? listRes.Contents.length : 0} objects.`);
    } catch (err) {
        console.error("❌ Root Connection Test Failed!");
        console.error(err.Code, err.message);
    }
}

testRoot();
