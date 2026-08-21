import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function fixTime(timeStr: string | null): string | null {
  if (!timeStr) return timeStr;
  
  // Format is usually 'HH:MM AM/PM'
  const match = timeStr.trim().match(/^0?(\d+):(\d+)\s*(AM|PM)?$/i);
  if (!match) return timeStr;

  let hour = parseInt(match[1], 10);
  const min = match[2];
  let currentSuffix = (match[3] || '').toUpperCase();

  // If time was originally parsed incorrectly or has a bad suffix:
  // hour > 9 and < 12 -> 10, 11
  // hour >= 1 and <= 7 -> 1, 2, 3, 4, 5, 6, 7
  
  if (hour > 9 && hour < 12) {
    currentSuffix = 'AM';
  } else if (hour >= 1 && hour <= 7) {
    currentSuffix = 'PM';
  }

  // Ensure hour is 12-hour format string padded with zero
  const hourStr = hour.toString().padStart(2, '0');
  
  return `${hourStr}:${min} ${currentSuffix}`.trim();
}

async function run() {
  const drafts = await prisma.fileDraft.findMany();
  let updatedCount = 0;

  for (const draft of drafts) {
    const newArr = fixTime(draft.timeOfArrival);
    const newDoc = fixTime(draft.docTime);

    if (newArr !== draft.timeOfArrival || newDoc !== draft.docTime) {
      console.log(`Updating ID ${draft.sNo}: Arr '${draft.timeOfArrival}' -> '${newArr}', Doc '${draft.docTime}' -> '${newDoc}'`);
      await prisma.fileDraft.update({
        where: { sNo: draft.sNo },
        data: {
          timeOfArrival: newArr,
          docTime: newDoc
        }
      });
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} records.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
