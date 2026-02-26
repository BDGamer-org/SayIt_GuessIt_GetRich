const MAX_LIVES = 5
const LIFE_RECOVERY_MS = 30 * 60 * 1000

const getSupabaseHeaders = (env, useServiceKey = false) => {
  const token = useServiceKey ? env.SUPABASE_SERVICE_KEY : env.SUPABASE_ANON_KEY
  return {
    'apikey': token,
    'Authorization': `Bearer ${token}`,
  }
}

const clampLives = (value) => {
  const lives = Number(value)
  if (!Number.isFinite(lives)) return MAX_LIVES
  return Math.max(0, Math.min(MAX_LIVES, lives))
}

const normalizeQueue = (rawQueue) => {
  let source = rawQueue
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source)
    } catch (e) {
      source = []
    }
  }
  if (!Array.isArray(source)) return []
  return source
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
    .sort((a, b) => a - b)
}

const isSameQueue = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

const applyLifeRecoveryState = (rawLives, rawQueue, nowMs = Date.now()) => {
  let lives = clampLives(rawLives)
  let queue = normalizeQueue(rawQueue)
  const originalLives = lives
  const originalQueue = [...queue]

  while (queue.length && nowMs - queue[0] >= LIFE_RECOVERY_MS && lives < MAX_LIVES) {
    queue.shift()
    lives += 1
  }

  const missingLives = Math.max(0, MAX_LIVES - lives)
  if (missingLives === 0) {
    queue = []
  } else {
    if (queue.length > missingLives) {
      queue = queue.slice(0, missingLives)
    }
    while (queue.length < missingLives) {
      queue.push(nowMs)
    }
  }

  return {
    lives,
    queue,
    nextRecoverAtMs: queue.length > 0 && lives < MAX_LIVES ? queue[0] + LIFE_RECOVERY_MS : null,
    changed: lives !== originalLives || !isSameQueue(queue, originalQueue)
  }
}

const buildLivesResponse = (state, nowMs = Date.now()) => {
  const remainSeconds = state.nextRecoverAtMs
    ? Math.max(0, Math.ceil((state.nextRecoverAtMs - nowMs) / 1000))
    : null

  return {
    lives: state.lives,
    max_lives: MAX_LIVES,
    next_recover_at: state.nextRecoverAtMs ? new Date(state.nextRecoverAtMs).toISOString() : null,
    next_recover_in_seconds: remainSeconds
  }
}

const fetchPlayerLifeRecord = async (env, playerId) => {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/players?id=eq.${encodeURIComponent(playerId)}&select=id,lives,life_recovery_queue`,
    {
      headers: getSupabaseHeaders(env, true)
    }
  )

  if (!response.ok) {
    const details = await response.text()
    if (details.includes('life_recovery_queue')) {
      throw new Error('数据库缺少 life_recovery_queue 字段，请先执行迁移 SQL')
    }
    throw new Error(`读取生命值失败: ${details}`)
  }

  const players = await response.json()
  if (!Array.isArray(players) || players.length === 0) {
    throw new Error('玩家不存在')
  }

  return players[0]
}

const persistPlayerLifeState = async (env, playerId, state) => {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/players?id=eq.${encodeURIComponent(playerId)}`,
    {
      method: 'PATCH',
      headers: {
        ...getSupabaseHeaders(env, true),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lives: state.lives,
        life_recovery_queue: state.queue
      })
    }
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`保存生命值失败: ${details}`)
  }
}
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
      // Register - Create new player with username and password
      if (path === '/api/register' && request.method === 'POST') {
        const body = await request.json()
        const username = body.username?.trim()
        const password = body.password

        if (!username) {
          return new Response(JSON.stringify({ error: '用户名不能为空' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (!password || password.length < 6) {
          return new Response(JSON.stringify({ error: '密码至少需要6位' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Check if username already exists
        const checkResponse = await fetch(
          `${env.SUPABASE_URL}/rest/v1/players?username=eq.${encodeURIComponent(username)}&select=id`,
          {
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            }
          }
        )

        const existing = await checkResponse.json()
        if (existing.length > 0) {
          return new Response(JSON.stringify({ error: '用户名已被使用' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Generate a dummy backup_code for backward compatibility
        const dummyBackupCode = Math.random().toString(36).substring(2, 10).toUpperCase()

        // Create player with username as player_name for compatibility
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
              username: username,
              password_hash: password, // In production, hash this!
              player_name: username,
              backup_code: dummyBackupCode, // For backward compatibility with old schema
              lives: 5,
              life_recovery_queue: []
            })
          }
        )

        if (!response.ok) {
          let errorMessage = '注册失败，请稍后重试'
          try {
            const errorData = await response.json()
            // Check for specific database errors
            if (errorData.message?.includes('username')) {
              errorMessage = '用户名已被使用'
            } else if (errorData.message?.includes('life_recovery_queue')) {
              errorMessage = '数据库缺少 life_recovery_queue 字段，请先执行迁移 SQL'
            } else if (errorData.message?.includes('null value')) {
              errorMessage = '系统错误：数据库配置不完整'
            } else {
              errorMessage = errorData.message || errorMessage
            }
          } catch (e) {
            // Use default error message
          }
          return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const playerData = await response.json()
        const player = playerData[0]

        return new Response(JSON.stringify({
          player_id: player.id,
          player_name: player.player_name || player.username,
          ...buildLivesResponse(applyLifeRecoveryState(player.lives, player.life_recovery_queue))
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Login - Authenticate with username and password
      if (path === '/api/login' && request.method === 'POST') {
        const body = await request.json()
        const username = body.username?.trim()
        const password = body.password

        if (!username || !password) {
          return new Response(JSON.stringify({ error: '请输入用户名和密码' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Find player by username
        const response = await fetch(
          `${env.SUPABASE_URL}/rest/v1/players?username=eq.${encodeURIComponent(username)}&select=*`,
          {
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            }
          }
        )

        const players = await response.json()

        if (players.length === 0) {
          return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const player = players[0]

        // Verify password (plain text comparison - in production, use bcrypt)
        if (player.password_hash !== password) {
          return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const nowMs = Date.now()
        const lifeState = applyLifeRecoveryState(player.lives, player.life_recovery_queue, nowMs)
        if (lifeState.changed) {
          await persistPlayerLifeState(env, player.id, lifeState)
        }

        return new Response(JSON.stringify({
          player_id: player.id,
          player_name: player.player_name || player.username,
          ...buildLivesResponse(lifeState, nowMs)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get lives
      if (path === '/api/lives' && request.method === 'GET') {
        const playerId = request.headers.get('X-Player-ID')

        if (!playerId) {
          return new Response(JSON.stringify({ error: 'X-Player-ID header required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const player = await fetchPlayerLifeRecord(env, playerId)
        const nowMs = Date.now()
        const state = applyLifeRecoveryState(player.lives, player.life_recovery_queue, nowMs)

        if (state.changed) {
          await persistPlayerLifeState(env, playerId, state)
        }

        return new Response(JSON.stringify(buildLivesResponse(state, nowMs)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Consume life
      if (path === '/api/lives/consume' && request.method === 'POST') {
        const playerId = request.headers.get('X-Player-ID')

        if (!playerId) {
          return new Response(JSON.stringify({ error: 'X-Player-ID header required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const nowMs = Date.now()
        const player = await fetchPlayerLifeRecord(env, playerId)
        const state = applyLifeRecoveryState(player.lives, player.life_recovery_queue, nowMs)

        if (state.lives <= 0) {
          if (state.changed) {
            await persistPlayerLifeState(env, playerId, state)
          }
          return new Response(JSON.stringify({
            error: '没有足够的体力',
            ...buildLivesResponse(state, nowMs)
          }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const consumedState = applyLifeRecoveryState(state.lives - 1, [...state.queue, nowMs], nowMs)
        await persistPlayerLifeState(env, playerId, consumedState)

        return new Response(JSON.stringify(buildLivesResponse(consumedState, nowMs)), {
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
          `${env.SUPABASE_URL}/rest/v1/players?id=eq.${playerId}&select=player_name,username`,
          {
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            }
          }
        )

        const players = await playerRes.json()
        const playerName = players[0]?.player_name || players[0]?.username || 'Player'

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
