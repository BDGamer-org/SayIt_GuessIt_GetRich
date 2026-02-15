# Cloudflare Worker Update

Replace your worker code with this to add the `/api/history` endpoint:

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

    // Get user history (latest 10 records for a player)
    if (path === '/api/history' && request.method === 'GET') {
      const player = url.searchParams.get('player')

      if (!player) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const response = await fetch(
        `${env.SUPABASE_URL}/rest/v1/scores?select=*&player_name=eq.${encodeURIComponent(player)}&order=created_at.desc&limit=10`,
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

## Changes Made

1. **Removed**: `/api/leaderboard` endpoint (global rankings)
2. **Added**: `/api/history?player=NAME` endpoint (user's last 10 games)
3. **Kept**: `/api/score` endpoint (submit scores)

## Test

```bash
# Get user history
curl "https://sgit-api.bdgamer.org/api/history?player=TestUser"

# Submit score
curl -X POST https://sgit-api.bdgamer.org/api/score \
  -H "Content-Type: application/json" \
  -d '{"player_name":"TestUser","score":150}'
```
