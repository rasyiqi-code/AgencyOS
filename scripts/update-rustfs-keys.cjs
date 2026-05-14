const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();

    const updates = [
        { key: 'r2_access_key_id', value: 'SOzhQGRnz41xbkHauCon' },
        { key: 'r2_secret_access_key', value: '9xB91GyTIgJgWZQMeQkU1MHwq2mQH89XbLNopPVI' }
    ];

    try {
        for (const update of updates) {
            await client.query(
                'UPDATE "SystemSetting" SET value = $1, "updatedAt" = NOW() WHERE key = $2',
                [update.value, update.key]
            );
            console.log(`Updated ${update.key} to ${update.value}`);
        }
        console.log("New access keys updated successfully.");
    } catch (err) {
        console.error("Error updating settings:", err);
    } finally {
        await client.end();
    }
}

main();
