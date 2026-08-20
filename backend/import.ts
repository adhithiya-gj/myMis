import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.includes('**Transferred**') || dateStr.trim() === '') return null;
  const parts = dateStr.trim().split('.');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }
  return null;
}

function parseTime(timeStr: string): string {
  if (!timeStr || timeStr.includes('**Transferred**') || timeStr.trim() === '') return '';
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${m} ${suffix}`;
  }
  return timeStr.trim();
}

async function run() {
  const content = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
  const lines = content.split('\n');
  
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('S No,')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    console.error("Could not find header row");
    return;
  }
  
  const records = lines.slice(headerIndex + 1);
  let count = 0;
  
  for (const line of records) {
    if (!line.trim()) continue;
    
    // Split by comma respecting quotes
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const parts = line.split(regex).map(s => s.replace(/^"|"$/g, '').trim());
    
    if (parts.length < 10) continue;
    if (!parts[0]) continue; // Empty S No
    
    let status = parts[9] || 'Pending';
    let remarks = parts[10] || '';
    if (status === 'Transferred' || parts[5].includes('**Transferred**')) {
      status = 'Pending';
      remarks = remarks ? `[Transferred] ${remarks}` : '[Transferred]';
    }

    const payload = {
      dateOfArrival: parseDate(parts[1]) || new Date(),
      timeOfArrival: parseTime(parts[2]),
      bank: parts[3] || '',
      borrowerName: parts[4] || '',
      dateOfCompletion: parseDate(parts[5]),
      docTime: parseTime(parts[6]),
      draftedBy: parts[7] || '',
      sanSrp: parts[8] || '',
      status: status,
      remarks: remarks
    };

    try {
      await prisma.fileDraft.create({ data: payload });
      count++;
    } catch (e) {
      console.error(`Failed to import row: ${parts[0]}`, e);
    }
  }
  
  console.log(`Successfully imported ${count} records!`);
  await prisma.$disconnect();
}

run().catch(console.error);
