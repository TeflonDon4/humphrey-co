import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const SCORE_LABEL = { 5: '🔥 Hot', 4: '⚡ Strong', 3: '✅ Solid', 2: '👀 Warm', 1: '💤 Cold' };

function scoreBar(n) {
  return '█'.repeat(n) + '░'.repeat(5 - n);
}

function formatLead(lead, i) {
  return `
─────────────────────────────
LEAD ${i + 1}: ${lead.name || 'Unknown'}
${SCORE_LABEL[lead.lead_score] || '–'} ${scoreBar(lead.lead_score)}

Firm/Role:  ${lead.firm || '–'} / ${lead.role || '–'}
Email:      ${lead.email || '–'}
Interest:   ${lead.interest || '–'}
Session ID: ${lead.sessionId || '–'}
Time:       ${new Date(lead.timestamp).toLocaleString('en-GB', { timeZone: 'Atlantic/Bermuda' })} (Bermuda)

Notes: ${lead.notes || 'None'}
`.trim();
}

export async function sendMorningDigest(leads) {
  const hot = leads.filter(l => l.lead_score >= 4);
  const solid = leads.filter(l => l.lead_score === 3);
  const cold = leads.filter(l => l.lead_score <= 2);

  const subject =
    hot.length > 0
      ? `🔥 Humphrey: ${hot.length} hot lead${hot.length > 1 ? 's' : ''} overnight — ${leads.length} total`
      : `Humphrey: ${leads.length} lead${leads.length > 1 ? 's' : ''} overnight`;

  const body = `
HUMPHREY — OVERNIGHT LEAD DIGEST
${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Generated: ${new Date().toLocaleString('en-GB', { timeZone: 'Atlantic/Bermuda' })} Bermuda time

SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total leads:   ${leads.length}
🔥 Hot (4-5):  ${hot.length}
✅ Solid (3):  ${solid.length}
💤 Cold (1-2): ${cold.length}

${hot.length > 0 ? `HOT LEADS — ACTION THESE FIRST\n${'═'.repeat(40)}\n${hot.map(formatLead).join('\n\n')}` : ''}

${solid.length > 0 ? `SOLID LEADS\n${'═'.repeat(40)}\n${solid.map((l, i) => formatLead(l, hot.length + i)).join('\n\n')}` : ''}

${cold.length > 0 ? `COLD / CURIOSITY\n${'═'.repeat(40)}\n${cold.map((l, i) => formatLead(l, hot.length + solid.length + i)).join('\n\n')}` : ''}

─────────────────────────────
Humphrey | BDA AI Agent Services
Kadikoy Limited group
`.trim();

  await resend.emails.send({
    from: process.env.RESEND_FROM || 'humphrey@aiagentservices.net',
    to: process.env.DIGEST_TO || 'bc@bdalaw.bm',
    subject,
    text: body,
  });

  console.log(`Morning digest sent — ${leads.length} leads`);
}
