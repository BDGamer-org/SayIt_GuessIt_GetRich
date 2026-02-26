const RECOVERY_CAP_LIVES = 5
const MAX_STORED_LIVES = 999999
const LIFE_RECOVERY_MS = 30 * 60 * 1000
const STRIPE_WEBHOOK_TOLERANCE_SEC = 300
const STRIPE_SAFE_MIN_AMOUNT_CENTS = 500
const RECHARGE_PLAN_CATALOG = {
  p1: {
    rewardType: 'lives',
    livesGain: 20,
    amountCents: 600,
    currency: 'cny',
    title: '生命值礼包 ¥6'
  },
  p2: {
    rewardType: 'lives',
    livesGain: 40,
    amountCents: 600,
    currency: 'cny',
    title: '生命值礼包 ¥6（限时优惠）'
  },
  p6: {
    rewardType: 'lives',
    livesGain: 40,
    amountCents: 600,
    currency: 'cny',
    title: '生命值礼包 ¥6（限时优惠）'
  },
  p12: {
    rewardType: 'lives',
    livesGain: 120,
    amountCents: 1200,
    currency: 'cny',
    title: '生命值礼包 ¥12'
  },
  p20_month: {
    rewardType: 'membership',
    membershipType: 'monthly',
    membershipDays: 30,
    amountCents: 2000,
    currency: 'cny',
    title: '月会员 ¥20'
  },
  p68_permanent: {
    rewardType: 'membership',
    membershipType: 'lifetime',
    amountCents: 6800,
    currency: 'cny',
    title: '终身会员 ¥68'
  }
}
const UNSUPPORTED_RECHARGE_PLANS = new Set()

const getSupabaseHeaders = (env, useServiceKey = false) => {
  const token = useServiceKey ? env.SUPABASE_SERVICE_KEY : env.SUPABASE_ANON_KEY
  return {
    'apikey': token,
    'Authorization': `Bearer ${token}`,
  }
}

const clampLives = (value) => {
  const lives = Number(value)
  if (!Number.isFinite(lives)) return RECOVERY_CAP_LIVES
  return Math.max(0, Math.min(MAX_STORED_LIVES, Math.floor(lives)))
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

  while (queue.length && nowMs - queue[0] >= LIFE_RECOVERY_MS && lives < RECOVERY_CAP_LIVES) {
    queue.shift()
    lives += 1
  }

  const missingLives = lives >= RECOVERY_CAP_LIVES
    ? 0
    : Math.max(0, RECOVERY_CAP_LIVES - lives)
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
    nextRecoverAtMs: queue.length > 0 && lives < RECOVERY_CAP_LIVES ? queue[0] + LIFE_RECOVERY_MS : null,
    changed: lives !== originalLives || !isSameQueue(queue, originalQueue)
  }
}

const buildLivesResponse = (state, nowMs = Date.now(), membershipState = null) => {
  const unlimitedLives = !!membershipState?.unlimitedLives
  const responseLives = unlimitedLives ? Math.max(state.lives, RECOVERY_CAP_LIVES) : state.lives
  const remainSeconds = !unlimitedLives && state.nextRecoverAtMs
    ? Math.max(0, Math.ceil((state.nextRecoverAtMs - nowMs) / 1000))
    : null

  return {
    lives: responseLives,
    max_lives: RECOVERY_CAP_LIVES,
    recovery_cap_lives: RECOVERY_CAP_LIVES,
    next_recover_at: !unlimitedLives && state.nextRecoverAtMs ? new Date(state.nextRecoverAtMs).toISOString() : null,
    next_recover_in_seconds: remainSeconds,
    vip_active: !!membershipState?.isActive,
    vip_type: membershipState?.type || 'none',
    vip_expires_at: membershipState?.expiresAt || null,
    unlimited_lives: unlimitedLives
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

const parseIsoMs = (value) => {
  if (typeof value !== 'string' || !value) return null
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

const buildMembershipState = (record, nowMs = Date.now()) => {
  if (!record || typeof record !== 'object') {
    return {
      isActive: false,
      type: 'none',
      expiresAt: null,
      unlimitedLives: false
    }
  }

  const type = record.membership_type === 'lifetime' || record.membership_type === 'monthly'
    ? record.membership_type
    : 'none'

  if (type === 'lifetime') {
    return {
      isActive: true,
      type: 'lifetime',
      expiresAt: null,
      unlimitedLives: true
    }
  }

  const expiresMs = parseIsoMs(record.expires_at)
  const isActive = type === 'monthly' && expiresMs !== null && expiresMs > nowMs
  return {
    isActive,
    type: isActive ? 'monthly' : 'none',
    expiresAt: isActive ? new Date(expiresMs).toISOString() : null,
    unlimitedLives: isActive
  }
}

const fetchPlayerMembership = async (env, playerId, strict = false) => {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/player_memberships?player_id=eq.${encodeURIComponent(playerId)}&select=player_id,membership_type,expires_at`,
    {
      headers: getSupabaseHeaders(env, true)
    }
  )

  if (!response.ok) {
    const details = await response.text()
    if (details.includes('player_memberships')) {
      if (strict) {
        throw new Error('数据库缺少 player_memberships 表，请先执行 Stripe 迁移 SQL')
      }
      return null
    }
    throw new Error(`读取会员状态失败: ${details}`)
  }

  const rows = await response.json()
  return rows[0] || null
}

const upsertPlayerMembership = async (env, payload) => {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/player_memberships`,
    {
      method: 'POST',
      headers: {
        ...getSupabaseHeaders(env, true),
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    const details = await response.text()
    if (details.includes('player_memberships')) {
      throw new Error('数据库缺少 player_memberships 表，请先执行 Stripe 迁移 SQL')
    }
    throw new Error(`保存会员状态失败: ${details}`)
  }

  const rows = await response.json()
  return rows[0] || null
}

const grantMembershipByPlan = async (env, playerId, plan, nowMs = Date.now()) => {
  if (!plan || plan.rewardType !== 'membership') {
    throw new Error('无效会员方案')
  }

  if (plan.membershipType === 'lifetime') {
    const row = await upsertPlayerMembership(env, {
      player_id: playerId,
      membership_type: 'lifetime',
      expires_at: null
    })
    return buildMembershipState(row, nowMs)
  }

  if (plan.membershipType === 'monthly') {
    const current = await fetchPlayerMembership(env, playerId, true)
    const currentState = buildMembershipState(current, nowMs)
    const currentExpiresMs = parseIsoMs(current?.expires_at)
    const baseMs = currentState.isActive && currentExpiresMs ? currentExpiresMs : nowMs
    const membershipDays = Number.isFinite(plan.membershipDays) ? plan.membershipDays : 30
    const expiresAt = new Date(baseMs + membershipDays * 24 * 60 * 60 * 1000).toISOString()

    const row = await upsertPlayerMembership(env, {
      player_id: playerId,
      membership_type: 'monthly',
      expires_at: expiresAt
    })
    return buildMembershipState(row, nowMs)
  }

  throw new Error('无效会员方案')
}

const grantLivesByPlan = async (env, playerId, planId, nowMs = Date.now()) => {
  const plan = RECHARGE_PLAN_CATALOG[planId]
  if (!plan || plan.rewardType !== 'lives') {
    throw new Error('无效充值方案')
  }

  const player = await fetchPlayerLifeRecord(env, playerId)
  const state = applyLifeRecoveryState(player.lives, player.life_recovery_queue, nowMs)
  const rechargedState = applyLifeRecoveryState(state.lives + plan.livesGain, state.queue, nowMs)
  await persistPlayerLifeState(env, playerId, rechargedState)
  return rechargedState
}

const applyPaidPlanReward = async (env, playerId, planId, nowMs = Date.now()) => {
  const plan = RECHARGE_PLAN_CATALOG[planId]
  if (!plan) {
    throw new Error('无效充值方案')
  }

  if (plan.rewardType === 'membership') {
    const membershipState = await grantMembershipByPlan(env, playerId, plan, nowMs)
    return {
      planType: 'membership',
      lifeState: null,
      membershipState
    }
  }

  const lifeState = await grantLivesByPlan(env, playerId, planId, nowMs)
  return {
    planType: 'lives',
    lifeState,
    membershipState: null
  }
}

const generateOrderNo = () => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `ORD_${Date.now()}_${random}`
}

const createPaymentOrder = async (env, order) => {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/payment_orders`, {
    method: 'POST',
    headers: {
      ...getSupabaseHeaders(env, true),
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(order)
  })

  if (!response.ok) {
    const details = await response.text()
    if (details.includes('payment_orders')) {
      throw new Error('数据库缺少 payment_orders 表，请先执行 Stripe 迁移 SQL')
    }
    throw new Error(`创建支付订单失败: ${details}`)
  }

  const rows = await response.json()
  return rows[0]
}

const updatePaymentOrderByNo = async (env, orderNo, patch) => {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/payment_orders?order_no=eq.${encodeURIComponent(orderNo)}`,
    {
      method: 'PATCH',
      headers: {
        ...getSupabaseHeaders(env, true),
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(patch)
    }
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`更新支付订单失败: ${details}`)
  }

  const rows = await response.json()
  return rows[0] || null
}

const fetchPaymentOrderByNo = async (env, orderNo, playerId = null) => {
  let url = `${env.SUPABASE_URL}/rest/v1/payment_orders?order_no=eq.${encodeURIComponent(orderNo)}&select=*`
  if (playerId) {
    url += `&player_id=eq.${encodeURIComponent(playerId)}`
  }

  const response = await fetch(url, {
    headers: getSupabaseHeaders(env, true)
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`读取支付订单失败: ${details}`)
  }

  const rows = await response.json()
  return rows[0] || null
}

const fetchPaymentOrderBySessionId = async (env, sessionId) => {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/payment_orders?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=*`,
    {
      headers: getSupabaseHeaders(env, true)
    }
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`读取 Stripe 会话订单失败: ${details}`)
  }

  const rows = await response.json()
  return rows[0] || null
}

const tryMarkStripeEventProcessed = async (env, eventId) => {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/stripe_webhook_events`, {
    method: 'POST',
    headers: {
      ...getSupabaseHeaders(env, true),
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates,return=representation'
    },
    body: JSON.stringify({ event_id: eventId })
  })

  if (!response.ok) {
    const details = await response.text()
    if (details.includes('stripe_webhook_events')) {
      throw new Error('数据库缺少 stripe_webhook_events 表，请先执行 Stripe 迁移 SQL')
    }
    throw new Error(`记录 Stripe 事件失败: ${details}`)
  }

  const rows = await response.json()
  return rows.length > 0
}

const encodeFormBody = (pairs) => {
  const params = new URLSearchParams()
  pairs.forEach(([key, value]) => {
    if (value === undefined || value === null) return
    params.append(key, String(value))
  })
  return params.toString()
}

const createStripeCheckoutSession = async (env, params) => {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('缺少 STRIPE_SECRET_KEY')
  }
  if (!env.STRIPE_SUCCESS_URL || !env.STRIPE_CANCEL_URL) {
    throw new Error('缺少 STRIPE_SUCCESS_URL 或 STRIPE_CANCEL_URL')
  }
  if (!Number.isFinite(params.amountCents) || params.amountCents < STRIPE_SAFE_MIN_AMOUNT_CENTS) {
    throw new Error(`支付金额过低，最低为 ¥${(STRIPE_SAFE_MIN_AMOUNT_CENTS / 100).toFixed(0)}`)
  }

  const body = encodeFormBody([
    ['mode', 'payment'],
    ['success_url', env.STRIPE_SUCCESS_URL],
    ['cancel_url', env.STRIPE_CANCEL_URL],
    ['client_reference_id', params.playerId],
    ['line_items[0][price_data][currency]', params.currency],
    ['line_items[0][price_data][unit_amount]', params.amountCents],
    ['line_items[0][price_data][product_data][name]', params.productName],
    ['line_items[0][quantity]', 1],
    ['metadata[order_no]', params.orderNo],
    ['metadata[player_id]', params.playerId],
    ['metadata[plan_id]', params.planId]
  ])

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Stripe 创建会话失败: ${details}`)
  }

  return await response.json()
}

const constantTimeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

const hmacSha256Hex = async (secret, payload) => {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const verifyStripeWebhookSignature = async (payload, signatureHeader, secret) => {
  if (!signatureHeader || !secret) return false
  let timestamp = ''
  const signatures = []
  signatureHeader.split(',').forEach((segment) => {
    const [k, v] = segment.split('=')
    if (!k || !v) return
    if (k.trim() === 't') timestamp = v.trim()
    if (k.trim() === 'v1') signatures.push(v.trim().toLowerCase())
  })

  if (!timestamp || !signatures.length) return false
  const timestampSec = Number(timestamp)
  if (!Number.isFinite(timestampSec)) return false
  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - timestampSec) > STRIPE_WEBHOOK_TOLERANCE_SEC) return false

  const signedPayload = `${timestamp}.${payload}`
  const expected = (await hmacSha256Hex(secret, signedPayload)).toLowerCase()
  return signatures.some((sig) => constantTimeEqual(sig, expected))
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

    if (path === '/pay/success' && request.method === 'GET') {
      const sessionId = url.searchParams.get('session_id') || ''
      const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>支付成功</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8f6f0;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif;color:#222}
    .card{padding:24px 28px;border:2px solid #333;border-radius:14px;background:#fff;text-align:center;max-width:90vw}
    .title{font-size:24px;font-weight:700;margin:0 0 10px}
    .sub{font-size:14px;opacity:.75;margin:0}
  </style>
</head>
<body>
  <div class="card">
    <p class="title">支付成功</p>
    <p class="sub">订单已受理${sessionId ? `（${sessionId}）` : ''}，请返回游戏查看体力。</p>
  </div>
</body>
</html>`
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    if (path === '/pay/cancel' && request.method === 'GET') {
      const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>支付取消</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8f6f0;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif;color:#222}
    .card{padding:24px 28px;border:2px solid #333;border-radius:14px;background:#fff;text-align:center;max-width:90vw}
    .title{font-size:24px;font-weight:700;margin:0 0 10px}
    .sub{font-size:14px;opacity:.75;margin:0}
  </style>
</head>
<body>
  <div class="card">
    <p class="title">已取消支付</p>
    <p class="sub">你可以返回游戏重新发起支付。</p>
  </div>
</body>
</html>`
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      })
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
        const membership = await fetchPlayerMembership(env, player.id, false)
        const membershipState = buildMembershipState(membership, nowMs)

        return new Response(JSON.stringify({
          player_id: player.id,
          player_name: player.player_name || player.username,
          ...buildLivesResponse(lifeState, nowMs, membershipState)
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
        const membership = await fetchPlayerMembership(env, playerId, false)
        const membershipState = buildMembershipState(membership, nowMs)

        if (state.changed) {
          await persistPlayerLifeState(env, playerId, state)
        }

        return new Response(JSON.stringify(buildLivesResponse(state, nowMs, membershipState)), {
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
        const membership = await fetchPlayerMembership(env, playerId, false)
        const membershipState = buildMembershipState(membership, nowMs)

        if (membershipState.unlimitedLives) {
          if (state.changed) {
            await persistPlayerLifeState(env, playerId, state)
          }
          return new Response(JSON.stringify(buildLivesResponse(state, nowMs, membershipState)), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (state.lives <= 0) {
          if (state.changed) {
            await persistPlayerLifeState(env, playerId, state)
          }
          return new Response(JSON.stringify({
            error: '没有足够的体力',
            ...buildLivesResponse(state, nowMs, membershipState)
          }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const nextLives = state.lives - 1
        const nextQueue = nextLives < RECOVERY_CAP_LIVES
          ? [...state.queue, nowMs]
          : [...state.queue]
        const consumedState = applyLifeRecoveryState(nextLives, nextQueue, nowMs)
        await persistPlayerLifeState(env, playerId, consumedState)

        return new Response(JSON.stringify(buildLivesResponse(consumedState, nowMs, membershipState)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create Stripe checkout order
      if (path === '/api/pay/checkout/create' && request.method === 'POST') {
        const playerId = request.headers.get('X-Player-ID')
        if (!playerId) {
          return new Response(JSON.stringify({ error: 'X-Player-ID header required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        let body = {}
        try {
          body = await request.json()
        } catch (e) {
          body = {}
        }

        const planId = typeof body.plan_id === 'string' ? body.plan_id : ''
        if (UNSUPPORTED_RECHARGE_PLANS.has(planId)) {
          return new Response(JSON.stringify({ error: '该充值方案暂未开通' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const plan = RECHARGE_PLAN_CATALOG[planId]
        if (!plan) {
          return new Response(JSON.stringify({ error: '无效充值方案' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        if (!Number.isFinite(plan.amountCents) || plan.amountCents < STRIPE_SAFE_MIN_AMOUNT_CENTS) {
          return new Response(JSON.stringify({
            error: `当前充值金额过低，请选择至少 ¥${(STRIPE_SAFE_MIN_AMOUNT_CENTS / 100).toFixed(0)} 的方案`
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const orderNo = generateOrderNo()
        await createPaymentOrder(env, {
          order_no: orderNo,
          player_id: playerId,
          plan_id: planId,
          amount_cents: plan.amountCents,
          currency: plan.currency,
          lives_gain: Number.isFinite(plan.livesGain) ? plan.livesGain : 0,
          status: 'pending',
          channel: 'stripe'
        })

        try {
          const session = await createStripeCheckoutSession(env, {
            orderNo,
            playerId,
            planId,
            amountCents: plan.amountCents,
            currency: plan.currency,
            productName: plan.title
          })

          await updatePaymentOrderByNo(env, orderNo, {
            stripe_session_id: session.id
          })

          return new Response(JSON.stringify({
            order_no: orderNo,
            checkout_url: session.url,
            stripe_session_id: session.id,
            expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (error) {
          await updatePaymentOrderByNo(env, orderNo, {
            status: 'failed',
            error_message: error.message || 'Stripe checkout 创建失败'
          })
          throw error
        }
      }

      // Query payment order status
      if (path === '/api/pay/order-status' && request.method === 'GET') {
        const playerId = request.headers.get('X-Player-ID')
        const orderNo = (url.searchParams.get('order_no') || '').trim()
        if (!playerId) {
          return new Response(JSON.stringify({ error: 'X-Player-ID header required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        if (!orderNo) {
          return new Response(JSON.stringify({ error: 'order_no required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const order = await fetchPaymentOrderByNo(env, orderNo, playerId)
        if (!order) {
          return new Response(JSON.stringify({ error: '订单不存在' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        let livesState = null
        let membershipState = buildMembershipState(null)
        if (order.status === 'paid') {
          const player = await fetchPlayerLifeRecord(env, playerId)
          const state = applyLifeRecoveryState(player.lives, player.life_recovery_queue, Date.now())
          if (state.changed) {
            await persistPlayerLifeState(env, playerId, state)
          }
          const membership = await fetchPlayerMembership(env, playerId, false)
          membershipState = buildMembershipState(membership)
          livesState = buildLivesResponse(state, Date.now(), membershipState)
        }

        return new Response(JSON.stringify({
          order_no: order.order_no,
          status: order.status,
          plan_id: order.plan_id,
          lives_gain: order.lives_gain,
          paid_at: order.paid_at || null,
          lives_state: livesState,
          membership_state: membershipState
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Stripe webhook
      if (path === '/api/stripe/webhook' && request.method === 'POST') {
        const payload = await request.text()
        const signature = request.headers.get('Stripe-Signature') || ''
        const verified = await verifyStripeWebhookSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET)
        if (!verified) {
          return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const event = JSON.parse(payload)
        const isNewEvent = await tryMarkStripeEventProcessed(env, event.id)
        if (!isNewEvent) {
          return new Response(JSON.stringify({ received: true, duplicate: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const eventType = event.type
        const session = event.data?.object || {}
        const sessionId = session.id

        if (eventType === 'checkout.session.completed' || eventType === 'checkout.session.async_payment_succeeded') {
          if (session.payment_status === 'paid') {
            const metadata = session.metadata || {}
            let order = null
            if (sessionId) {
              order = await fetchPaymentOrderBySessionId(env, sessionId)
            }
            if (!order && metadata.order_no) {
              order = await fetchPaymentOrderByNo(env, metadata.order_no)
            }

            if (order && order.status !== 'paid') {
              const reward = await applyPaidPlanReward(env, order.player_id, order.plan_id, Date.now())
              await updatePaymentOrderByNo(env, order.order_no, {
                status: 'paid',
                paid_at: new Date().toISOString(),
                stripe_session_id: sessionId || order.stripe_session_id,
                stripe_payment_intent: session.payment_intent || null,
                paid_lives_snapshot: reward.lifeState ? reward.lifeState.lives : null
              })
            }
          }
        } else if (eventType === 'checkout.session.async_payment_failed') {
          if (sessionId) {
            const order = await fetchPaymentOrderBySessionId(env, sessionId)
            if (order && order.status === 'pending') {
              await updatePaymentOrderByNo(env, order.order_no, {
                status: 'failed',
                error_message: 'Stripe async payment failed'
              })
            }
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Legacy direct recharge endpoint is disabled in production flow.
      if (path === '/api/lives/recharge' && request.method === 'POST') {
        return new Response(JSON.stringify({ error: '请使用 Stripe 支付流程充值' }), {
          status: 410,
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
