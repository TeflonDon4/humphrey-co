import express from 'express';
import cors from 'cors';
import { chat } from './chat.js';
import { saveLead, getOvernightLeads } from './leads.js';
import { sendMorningDigest } from './digest.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, sessionId } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const { reply, lead } = await chat(messages);

    // If Humphrey has captured a lead, save it
    if (lead) {
      await saveLead({ ...lead, sessionId });
    }

    res.json({ reply, leadCaptured: !!lead });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Manual digest trigger (call this from cron or manually)
app.post('/api/digest', async (req, res) => {
  const secret = req.headers['x-digest-secret'];
  if (secret !== process.env.DIGEST_SECRET) {
    return res.status(401).json({ error: 'Unauthorised' });
  }
  try {
    const leads = await getOvernightLeads();
    if (leads.length === 0) {
      return res.json({ message: 'No leads overnight' });
    }
    await sendMorningDigest(leads);
    res.json({ message: `Digest sent — ${leads.length} lead(s)` });
  } catch (err) {
    console.error('Digest error:', err);
    res.status(500).json({ error: 'Digest failed' });
  }
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', agent: 'Humphrey' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Humphrey running on port ${PORT}`));
