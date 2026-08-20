import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const drafts = await prisma.fileDraft.findMany();
  
  const banks = new Set<string>();
  const drafters = new Set<string>();

  for (const d of drafts) {
    if (d.bank) banks.add(d.bank.trim());
    if (d.draftedBy) drafters.add(d.draftedBy.trim());
  }

  for (const b of banks) {
    if (!b) continue;
    const exists = await prisma.bank.findFirst({ where: { name: b } });
    if (!exists) {
      await prisma.bank.create({ data: { name: b } });
      console.log('Created bank:', b);
    }
  }

  for (const d of drafters) {
    if (!d) continue;
    const exists = await prisma.drafter.findFirst({ where: { name: d } });
    if (!exists) {
      await prisma.drafter.create({ data: { name: d } });
      console.log('Created drafter:', d);
    }
  }
  
  console.log('Done populating banks and drafters');
}
run().catch(console.error).finally(() => prisma.$disconnect());
