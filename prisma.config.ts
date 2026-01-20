import 'dotenv/config';
import { defineConfig } from '@prisma/config';

console.log("Loading config. DB URL exists?", !!process.env.DATABASE_URL);

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL
    }
});
