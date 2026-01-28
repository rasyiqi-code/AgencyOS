import { prisma } from "../../lib/db";

async function main() {
  console.log("Checking settings...");
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "r2_public_domain" }
  });
  console.log("R2 Domain Setting:", setting);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
