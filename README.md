# Humphrey — BDA AI Agent Services Intake Agent

Humphrey is the intake agent for BDA AI Agent Services, part of the Kadikoy Limited group.
He operates in Mandarin (default) and English, qualifies professional leads, and sends a morning digest via Resend.

## Files

```
humphrey/
  src/
    server.js   — Express app, routes
    chat.js     — Anthropic API call + lead extraction
    leads.js    — Lead storage (JSON file, swap for Supabase later)
    digest.js   — Resend morning email
  public/
    index.html  — Chat UI (served statically)
  package.json
  railway.toml
  .env.example
```

## Deploy to Railway (tonight)

1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Select the repo
4. Add environment variables (copy from .env.example):
   - ANTHROPIC_API_KEY
   - RESEND_API_KEY
   - RESEND_FROM
   - DIGEST_TO
   - DIGEST_SECRET
5. Railway auto-deploys. Your URL will be something like humphrey.railway.app

## Morning digest — two options

**Option A — Manual (tonight):**
Call the digest endpoint yourself each morning:
```
curl -X POST https://your-railway-url/api/digest \
  -H "x-digest-secret: your-secret-here"
```

**Option B — Automated cron (Railway):**
In Railway dashboard → your service → Settings → Cron Jobs:
```
0 11 * * *
```
(11:00 UTC = 07:00 Bermuda time)
Command: `curl -X POST http://localhost:3000/api/digest -H "x-digest-secret: $DIGEST_SECRET"`

## Custom domain (aiagentservices.net)

In Railway: Settings → Domains → Add custom domain → follow DNS instructions.
Point a CNAME from `chat.aiagentservices.net` to your Railway URL.

## Lead storage upgrade (later)

Currently leads save to `leads.json` on the Railway volume.
To upgrade to Supabase: replace `src/leads.js` with a Supabase client.
The rest of the code stays identical.

## Health check

GET /health → { status: "ok", agent: "Humphrey" }
