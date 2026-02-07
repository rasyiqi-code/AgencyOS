
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for SquadProfile model...');
    // This will fail at compile time if SquadProfile doesn't exist in the client
    try {
        // Just check if the property exists on the client instance
        if ('squadProfile' in prisma) {
            console.log('SquadProfile model exists in Prisma Client.');
        } else {
            console.error('SquadProfile model DOES NOT exist in Prisma Client.');
        }

        if ('missionApplication' in prisma) {
            console.log('MissionApplication model exists in Prisma Client.');
        } else {
            console.error('MissionApplication model DOES NOT exist in Prisma Client.');
        }
    } catch (e) {
        console.error(e);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
