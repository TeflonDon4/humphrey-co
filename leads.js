import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const LEADS_FILE = process.env.LEADS_FILE || './leads.json';

async function readLeads() {
  if (!existsSync(LEADS_FILE)) return [];
  try {
    const raw = await readFile(LEADS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLeads(leads) {
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

export async function saveLead(lead) {
  const leads = await readLeads();
  const entry = {
    ...lead,
    timestamp: new Date().toISOString(),
    id: `lead_${Date.now()}`,
  };
  leads.push(entry);
  await writeLeads(leads);
  console.log(`Lead saved: ${entry.name} — score ${entry.lead_score}`);
  return entry;
}

// Get leads from the last N hours (default 12 — overnight window)
export async function getOvernightLeads(hoursBack = 12) {
  const leads = await readLeads();
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  return leads.filter(l => new Date(l.timestamp) > cutoff);
}
