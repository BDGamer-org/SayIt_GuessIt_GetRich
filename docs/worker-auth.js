// Cloudflare Worker with Auth System
// Endpoints:
// POST /api/register - Create new player, returns {backup_code, token, player_name}
// POST /api/recover - Restore player by backup_code, returns {token, player_name}
// GET  /api/history - Get user's last 10 scores (requires token)
// POST /api/score   - Submit score (requires token)

// JWT Secret (set in Cloudflare Worker environment variables)
const JWT_SECRET = 'your-secret-key-change-this-in-production';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // ============================================
    // POST /api/register - Create new player
    // ============================================
    if (path === '/api/register' && request.method === 'POST') {
      const body = await request.json()
      const playerName = body.player_name?.trim() || 'Player'

      // Generate backup code via Supabase function
      const codeResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/rpc/generate_backup_code`,
        {
          method: 'POST',
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          }
        }
      )

      const backupCode = await codeResponse.json()

      // Create player
      const playerResponse = await fetch(
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

      const playerData = await playerResponse.json()
      const player = playerData[0]

      // Generate JWT token
      const token = await generateJWT(player.id, env.JWT_SECRET)

      return new Response(JSON.stringify({
        token,
        backup_code: player.backup_code,
        player_name: player.player_name,
        player_id: player.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ============================================
    // POST /api/recover - Restore player by backup code
    // ============================================
    if (path === '/api/recover' && request.method === 'POST') {
      const body = await request.json()
      const backupCode = body.backup_code?.toUpperCase().trim()

      if (!backupCode) {
        return new Response(JSON.stringify({ error: 'Backup code required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Find player by backup code
      const playerResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/players?backup_code=eq.${backupCode}&select=*`,
        {
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          }
        }
      )

      const players = await playerResponse.json()

      if (players.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid backup code' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const player = players[0]

      // Generate new JWT token
      const token = await generateJWT(player.id, env.JWT_SECRET)

      return new Response(JSON.stringify({
        token,
        player_name: player.player_name,
        player_id: player.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ============================================
    // GET /api/history - Get user's last 10 scores
    // ============================================
    if (path === '/api/history' && request.method === 'GET') {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const token = authHeader.replace('Bearer ', '')
      const payload = await verifyJWT(token, env.JWT_SECRET)

      if (!payload) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const playerId = payload.player_id

      // Get last 10 scores for this player
      const response = await fetch(
        `${env.SUPABASE_URL}/rest/v1/scores?select=*&player_id=eq.${playerId}&order=created_at.desc&limit=10`,
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

    // ============================================
    // POST /api/score - Submit score
    // ============================================
    if (path === '/api/score' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const token = authHeader.replace('Bearer ', '')
      const payload = await verifyJWT(token, env.JWT_SECRET)

      if (!payload) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const body = await request.json()
      const playerId = payload.player_id

      // Get player name
      const playerResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/players?id=eq.${playerId}&select=player_name`,
        {
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          }
        }
      )

      const players = await playerResponse.json()
      const playerName = players[0]?.player_name || 'Player'

      // Insert score
      const response = await fetch(
        `${env.SUPABASE_URL}/rest/v1/scores`,
        {
          method: 'POST',
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            player_id: playerId,
            player_name: playerName,
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

// ============================================
// JWT Functions
// ============================================

async function generateJWT(playerId, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    player_id: playerId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const data = `${encodedHeader}.${encodedPayload}`

  const signature = await hmacSha256(data, secret)
  const encodedSignature = base64UrlEncode(signature)

  return `${data}.${encodedSignature}`
}

async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [header, payload, signature] = parts
    const data = `${header}.${payload}`

    const expectedSignature = await hmacSha256(data, secret)
    const encodedExpectedSignature = base64UrlEncode(expectedSignature)

    if (signature !== encodedExpectedSignature) return null

    const decodedPayload = JSON.parse(base64UrlDecode(payload))

    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decodedPayload
  } catch (e) {
    return null
  }
}

async function hmacSha256(message, secret) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  return new Uint8Array(signature)
}

function base64UrlEncode(buffer) {
  if (typeof buffer === 'string') {
    buffer = new TextEncoder().encode(buffer)
  }

  const base64 = btoa(String.fromCharCode(...buffer))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64UrlDecode(str) {
  str += new Array(5 - str.length % 4).join('=')
  str = str.replace(/\-/g, '+').replace(/\_/g, '/')
  return atob(str)
}
