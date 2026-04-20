import { PrismaClient } from '@prisma/client';
import { seedIso16363 } from './seed/iso16363';

const prisma = new PrismaClient();

async function main() {
  await seedIso16363(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
