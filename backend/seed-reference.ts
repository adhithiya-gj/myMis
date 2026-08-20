import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const drafts = await prisma.fileDraft.findMany();
  
  const banks = new Set(drafts.map(d => d.bank));
  const drafters = new Set(drafts.map(d => d.draftedBy));

  let bankCount = 0;
  for (const b of banks) {
    if (b && b.trim() !== '') {
      try {
        await prisma.bank.upsert({
          where: { name: b.trim() },
          update: {},
          create: { name: b.trim() }
        });
        bankCount++;
      } catch (e) {
        console.error("Error upserting bank:", b, e);
      }
    }
  }

  let drafterCount = 0;
  for (const d of drafters) {
    if (d && d.trim() !== '') {
      try {
        await prisma.drafter.upsert({
          where: { name: d.trim() },
          update: {},
          create: { name: d.trim() }
        });
        drafterCount++;
      } catch (e) {
        console.error("Error upserting drafter:", d, e);
      }
    }
  }
  
  console.log(`Seeded successfully! Inserted ${bankCount} banks and ${drafterCount} drafters.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
