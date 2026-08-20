import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Auth Endpoints
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  
  if (user && user.password === password) {
    return res.json({ token: 'mock-jwt-token-12345' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.put('/api/auth/credentials', async (req: Request, res: Response) => {
  const { newUsername, newPassword, oldUsername } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username: oldUsername } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { username: newUsername, password: newPassword }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update credentials' });
  }
});


// GET all FileDrafts
app.get('/api/drafts', async (req: Request, res: Response) => {
  try {
    const drafts = await prisma.fileDraft.findMany({
      orderBy: { sNo: 'desc' }
    });
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// POST new FileDraft
app.post('/api/drafts', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newDraft = await prisma.fileDraft.create({
      data: {
        dateOfArrival: new Date(data.dateOfArrival),
        timeOfArrival: data.timeOfArrival || null,
        bank: data.bank,
        borrowerName: data.borrowerName,
        dateOfCompletion: data.dateOfCompletion ? new Date(data.dateOfCompletion) : null,
        docTime: data.docTime || null,
        draftedBy: data.draftedBy,
        sanSrp: data.sanSrp,
        status: data.status,
        remarks: data.remarks || null,
      }
    });
    res.status(201).json(newDraft);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create draft' });
  }
});
// GET FileDraft by ID
app.get('/api/drafts/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const draft = await prisma.fileDraft.findUnique({
      where: { sNo: id }
    });
    if (!draft) return res.status(404).json({ error: 'Not found' });
    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

// DELETE FileDraft
app.delete('/api/drafts/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.fileDraft.delete({ where: { sNo: id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

// PATCH FileDraft (Update Completion Details)
app.patch('/api/drafts/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const updatedDraft = await prisma.fileDraft.update({
      where: { sNo: id },
      data: {
        dateOfCompletion: data.dateOfCompletion ? new Date(data.dateOfCompletion) : null,
        docTime: data.docTime || null,
        status: data.status,
        remarks: data.remarks || null,
      }
    });
    res.json(updatedDraft);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update draft' });
  }
});
// GET all Banks
app.get('/api/banks', async (req: Request, res: Response) => {
  try {
    const banks = await prisma.bank.findMany({ orderBy: { name: 'asc' } });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

// POST new Bank
app.post('/api/banks', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newBank = await prisma.bank.create({ data: { name } });
    res.status(201).json(newBank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bank' });
  }
});

// PUT update Bank
app.put('/api/banks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    const updatedBank = await prisma.bank.update({
      where: { id },
      data: { name }
    });
    res.json(updatedBank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bank' });
  }
});

// DELETE Bank
app.delete('/api/banks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.bank.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bank' });
  }
});

// GET all Drafters
app.get('/api/drafters', async (req: Request, res: Response) => {
  try {
    const drafters = await prisma.drafter.findMany({ orderBy: { name: 'asc' } });
    res.json(drafters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drafters' });
  }
});

// POST new Drafter
app.post('/api/drafters', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newDrafter = await prisma.drafter.create({ data: { name } });
    res.status(201).json(newDrafter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create drafter' });
  }
});

// PUT update Drafter
app.put('/api/drafters/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    const updatedDrafter = await prisma.drafter.update({
      where: { id },
      data: { name }
    });
    res.json(updatedDrafter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update drafter' });
  }
});

// DELETE Drafter
app.delete('/api/drafters/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.drafter.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete drafter' });
  }
});

async function seedDefaultUser() {
  const count = await prisma.user.count();
  if (count === 0) {
    await prisma.user.create({
      data: { username: 'admin', password: 'password' }
    });
    console.log('Seeded default admin user');
  }
}
seedDefaultUser();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
