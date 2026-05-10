
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to:", process.env.DATABASE_URL?.split('@')[1]);
    const settingsCount = await prisma.systemSetting.count();
    const serviceCount = await prisma.service.count();
    console.log("Settings found:", settingsCount);
    console.log("Services found:", serviceCount);
    
    if (settingsCount === 0 && serviceCount === 0) {
      console.warn("WARNING: Database is EMPTY!");
    } else {
      console.log("Database contains data.");
    }
  } catch (error) {
    console.error("Connectivity Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
