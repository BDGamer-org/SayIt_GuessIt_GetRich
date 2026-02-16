// Simplified Worker - No JWT, direct player_id
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Player-ID',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Register
      if (path === '/api/register' && request.method === 'POST') {
        const body = await request.json()
        const playerName = body.player_name?.trim() || 'Player'

        // Generate backup code manually
        const backupCode = Math.random().toString(36).substring(2, 10).toUpperCase()

        // Create player
        const response = await fetch(
          `${env.SUPABASE_URL}/rest/v1/players`,
          {
            method: 'POST',
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              backup_code: backupCode,
              player_name: playerName
            })
          }
        )

        if (!response.ok) {
          const error = await response.text()
          return new Response(JSON.stringify({ error }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const playerData = await response.json()
        const player = playerData[0]

        return new Response(JSON.stringify({
          player_id: player.id,
          backup_code: player.backup_code,
          player_name: player.player_name
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Recover
      if (path === '/api/recover' && request.method === 'POST') {
        const body = await request.json()
        const backupCode = body.backup_code?.toUpperCase().trim()

        const response = await fetch(
          `${env.SUPABASE_URL}/rest/v1/players?backup_code=eq.${backupCode}&select=*`,
          {
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            }
          }
        )

        const players = await response.json()

        if (players.length === 0) {
          return new Response(JSON.stringify({ error: 'Invalid backup code' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({
          player_id: players[0].id,
          player_name: players[0].player_name
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get history
      if (path === '/api/history' && request.method === 'GET') {
        const playerId = request.headers.get('X-Player-ID')

        if (!playerId) {
          return new Response(JSON.stringify({ error: 'X-Player-ID header required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const response = await fetch(
          `${env.SUPABASE_URL}/rest/v1/scores?player_id=eq.${playerId}&order=created_at.desc&limit=10`,
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

      // Get words
      if (path === '/api/words' && request.method === 'GET') {
        const category = url.searchParams.get('category')
        const requestedLimit = Number(url.searchParams.get('limit') || '320')
        const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
          ? Math.min(requestedLimit, 500)
          : 320
        const exclude = (url.searchParams.get('exclude') || '')
          .split(',')
          .map((id) => id.trim())
          .filter((id) => /^\d+$/.test(id))
          .slice(0, 300)

        let baseQuery = `${env.SUPABASE_URL}/rest/v1/word_bank?select=word_id,word,category`
        if (category) {
          baseQuery += `&category=eq.${encodeURIComponent(category)}`
        }
        if (exclude.length) {
          baseQuery += `&word_id=not.in.(${exclude.join(',')})`
        }

        // Keep payload small and avoid always returning the same first page.
        let offset = 0
        const countRes = await fetch(`${baseQuery}&limit=1`, {
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Prefer': 'count=exact'
          }
        })

        if (countRes.ok) {
          const range = countRes.headers.get('content-range') || ''
          const total = Number(range.split('/')[1] || '0')
          if (Number.isFinite(total) && total > limit) {
            offset = Math.floor(Math.random() * (total - limit + 1))
          }
        }

        const query = `${baseQuery}&order=word_id.asc&limit=${limit}&offset=${offset}`
        const response = await fetch(query, {
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          }
        })

        if (!response.ok) {
          const error = await response.text()
          return new Response(JSON.stringify({ error }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const words = await response.json()
        return new Response(JSON.stringify(words), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Submit score
      if (path === '/api/score' && request.method === 'POST') {
        const playerId = request.headers.get('X-Player-ID')

        if (!playerId) {
          return new Response(JSON.stringify({ error: 'X-Player-ID header required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const body = await request.json()

        // Get player name
        const playerRes = await fetch(
          `${env.SUPABASE_URL}/rest/v1/players?id=eq.${playerId}&select=player_name`,
          {
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            }
          }
        )

        const players = await playerRes.json()
        const playerName = players[0]?.player_name || 'Player'

        // Insert score
        await fetch(
          `${env.SUPABASE_URL}/rest/v1/scores`,
          {
            method: 'POST',
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              player_id: playerId,
              player_name: playerName,
              score: body.score
            })
          }
        )

        return new Response('OK', { headers: corsHeaders })
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders })

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}
