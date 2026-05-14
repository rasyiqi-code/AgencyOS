import { listFiles, uploadFile } from '../lib/integrations/storage';

async function testConnection() {
    console.log("--- Testing RustFS Connection ---");
    
    try {
        console.log("1. Attempting to list files...");
        const files = await listFiles();
        console.log(`Success! Found ${files.length} files.`);
        if (files.length > 0) {
            console.log("First few files:", files.slice(0, 3).map(f => f.key));
        }

        console.log("\n2. Attempting to upload a test file...");
        const testContent = Buffer.from(`Test upload from AgencyOS at ${new Date().toISOString()}`);
        const testPath = `test-connection-${Date.now()}.txt`;
        const url = await uploadFile(testContent, testPath, 'text/plain');
        console.log(`Success! Test file uploaded to: ${url}`);

    } catch (error) {
        console.error("\n❌ Connection Test Failed!");
        console.error("Error details:", error);
        
        if (error instanceof Error) {
            console.error("Message:", error.message);
            console.error("Stack:", error.stack);
        }
    }
}

testConnection();
