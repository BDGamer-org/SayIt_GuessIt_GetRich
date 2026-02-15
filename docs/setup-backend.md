# Setup Guide: Supabase + Cloudflare Worker

## Step 1: Create Table in Supabase

Go to your Supabase project → **Table Editor** → **New Table**

**Table name:** `scores`

| Column | Type | Settings |
|--------|------|----------|
| `id` | bigint | Primary key, auto-increment |
| `player_name` | text | Required |
| `score` | bigint | Required |
| `created_at` | timestamptz | Default: now() |

**Enable RLS** (Row Level Security) and add this policy:

```sql
CREATE POLICY "Allow all" ON scores
FOR ALL USING (true) WITH CHECK (true);
```

---

## Step 2: Create Cloudflare Worker

Go to [cloudflare.com](https://cloudflare.com) → **Workers & Pages** → **Create a Worker**

Name it: `sayit-api` (or your preferred name)

Replace the default code with:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Get leaderboard
    if (path === '/api/leaderboard' && request.method === 'GET') {
      const response = await fetch(
        `${env.SUPABASE_URL}/rest/v1/scores?select=*&order=score.desc&limit=10`,
        {
          headers: {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          }
        }
      )

      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Submit score
    if (path === '/api/score' && request.method === 'POST') {
      const body = await request.json()

      const response = await fetch(
        `${env.SUPABASE_URL}/rest/v1/scores`,
        {
          method: 'POST',
          headers: {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            player_name: body.player_name,
            score: body.score
          })
        }
      )

      return new Response('OK', {
        status: response.status,
        headers: corsHeaders
      })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  }
}
```

---

## Step 3: Add Environment Variables

In your Cloudflare Worker → **Settings** → **Variables**

Add these **Environment Variables**:

| Variable Name | Value |
|--------------|-------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbG...` (your anon key) |

**Where to find these:**
- Supabase → Project Settings → API → Project URL
- Supabase → Project Settings → API → Project API keys → `anon` `public`

---

## Step 4: Deploy & Test

Click **Deploy** in Cloudflare Worker

Your API URL will be:
```
https://sayit-api.your-subdomain.workers.dev
```

**Test with curl:**

```bash
# Get leaderboard
curl https://sayit-api.your-subdomain.workers.dev/api/leaderboard

# Submit score
curl -X POST https://sayit-api.your-subdomain.workers.dev/api/score \
  -H "Content-Type: application/json" \
  -d '{"player_name":"Player1","score":100}'
```

---

## Step 5: Update Vue App (Next)

Once your Worker is deployed, share your Worker URL and I'll add:

- Leaderboard button on home screen
- Score submission after game ends
- Top 10 display on result screen
- Player name input (first time)

**Your Worker URL:** `https://__________.workers.dev`
