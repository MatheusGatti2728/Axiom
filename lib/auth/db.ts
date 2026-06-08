// ================================================================
// AXIOM -- Persistent Storage via Upstash Redis
// Uses direct REST API endpoints for maximum reliability
// ================================================================

export interface AxiomOnboarding {
  role?:        string
  company?:     string
  segment?:     string
  volume?:      string
  phone?:       string
  cpf?:         string
  operacao?:    string
  foco?:        string
  usuarios?:    string
  completedAt?: string
}

export interface AxiomUser {
  id:                 string
  email:              string
  name:               string
  passwordHash:       string
  stripeCustomerId?:  string
  subscriptionId?:    string
  subscriptionStatus: "active" | "inactive" | "trialing" | "canceled"
  planId?:            string
  createdAt:          string
  usageByMonth?:      Record<string, number>
  onboarding?:        AxiomOnboarding
  onboardingDone?:    boolean
  role?:              "user" | "internal" | "admin"
  internalAccess?:    boolean
  internalNote?:      string
}

// In-memory fallback for local dev
const MEM = new Map<string, string>()

function getEnv() {
  return {
    url:   process.env.UPSTASH_REDIS_REST_URL   ?? "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  }
}

// Core Redis operations using Upstash REST API
// Uses POST /pipeline for atomic multi-command operations
async function exec(commands: any[][]): Promise<any[]> {
  const { url, token } = getEnv()
  if (!url || !token) return []
  
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    })
    
    if (!res.ok) {
      console.error("[db] Upstash error:", res.status, await res.text())
      return []
    }
    
    const data = await res.json()
    return Array.isArray(data) ? data.map((r: any) => r.result) : []
  } catch (err) {
    console.error("[db] fetch error:", err)
    return []
  }
}

async function redisGet(key: string): Promise<string | null> {
  const { url, token } = getEnv()
  if (!url || !token) return MEM.get(key) ?? null
  
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) return MEM.get(key) ?? null
    const data = await res.json()
    if (data.result === null || data.result === undefined) return null
    return String(data.result)
  } catch {
    return MEM.get(key) ?? null
  }
}

async function redisSet(key: string, value: string): Promise<void> {
  const { url, token } = getEnv()
  if (!url || !token) { MEM.set(key, value); return }
  
  try {
    // Use pipeline for reliable JSON value storage
    const res = await fetch(`${url}/pipeline`, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([["SET", key, value]]),
      cache: "no-store",
    })
    if (!res.ok) {
      console.error("[db] SET error:", res.status, await res.text())
      MEM.set(key, value)
    }
  } catch (err) {
    console.error("[db] SET exception:", err)
    MEM.set(key, value)
  }
}

async function redisSetEx(key: string, value: string, ttl: number): Promise<void> {
  const { url, token } = getEnv()
  if (!url || !token) { MEM.set(key, value); return }
  
  try {
    // Use pipeline for atomic SET + EXPIRE
    const results = await exec([
      ["SET", key, value],
      ["EXPIRE", key, ttl],
    ])
    if (!results.length) MEM.set(key, value)
  } catch {
    MEM.set(key, value)
  }
}

async function redisDel(key: string): Promise<void> {
  const { url, token } = getEnv()
  if (!url || !token) { MEM.delete(key); return }
  try {
    await fetch(`${url}/del/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch { MEM.delete(key) }
}

async function redisKeys(pattern: string): Promise<string[]> {
  const { url, token } = getEnv()
  if (!url || !token) {
    const prefix = pattern.replace("*", "")
    return Array.from(MEM.keys()).filter(k => k.startsWith(prefix))
  }
  try {
    const res = await fetch(`${url}/keys/${encodeURIComponent(pattern)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.result) ? data.result : []
  } catch { return [] }
}

// ── Public API ─────────────────────────────────────────────────

export async function dbGetUser(id: string): Promise<AxiomUser | null> {
  const raw = await redisGet(`user:${id}`)
  if (!raw) return null
  try { return JSON.parse(raw) as AxiomUser } catch { return null }
}

export async function dbGetUserByEmail(email: string): Promise<AxiomUser | null> {
  const lc  = email.toLowerCase().trim()
  const raw = await redisGet(`email:${lc}`)
  if (!raw) return null
  try {
    const ref = JSON.parse(raw) as { id: string }
    return await dbGetUser(ref.id)
  } catch { return null }
}

export async function dbGetUserByStripeId(customerId: string): Promise<AxiomUser | null> {
  const raw = await redisGet(`stripe:${customerId}`)
  if (!raw) return null
  try {
    const ref = JSON.parse(raw) as { id: string }
    return await dbGetUser(ref.id)
  } catch { return null }
}

export async function dbSaveUser(user: AxiomUser): Promise<void> {
  const userJson  = JSON.stringify(user)
  const emailJson = JSON.stringify({ id: user.id })
  const emailKey  = `email:${user.email.toLowerCase().trim()}`

  // Save user data and email index
  await redisSet(`user:${user.id}`, userJson)
  await redisSet(emailKey, emailJson)

  if (user.stripeCustomerId) {
    await redisSet(`stripe:${user.stripeCustomerId}`, emailJson)
  }
}

export async function dbGetAllUsers(): Promise<AxiomUser[]> {
  const keys  = await redisKeys("user:*")
  const users = await Promise.all(
    keys.map(async k => {
      const raw = await redisGet(k)
      if (!raw) return null
      try { return JSON.parse(raw) as AxiomUser } catch { return null }
    })
  )
  return users.filter(Boolean) as AxiomUser[]
}

// ── Session management ─────────────────────────────────────────

export async function setActiveSession(userId: string, token: string): Promise<void> {
  await redisSetEx(`session:${userId}`, token, 31 * 24 * 60 * 60)
}

export async function getActiveSession(userId: string): Promise<string | null> {
  return redisGet(`session:${userId}`)
}

export async function invalidateSession(userId: string): Promise<void> {
  await redisDel(`session:${userId}`)
}

// ── Temp login token ───────────────────────────────────────────

export async function setTempLoginToken(token: string, data: { email: string; password: string }): Promise<void> {
  await redisSetEx(`tmpauth:${token}`, JSON.stringify(data), 10 * 60)
}

export async function getTempLoginToken(token: string): Promise<{ email: string; password: string } | null> {
  const key = `tmpauth:${token}`
  const raw = await redisGet(key)
  if (!raw) return null
  try { await redisDel(key); return JSON.parse(raw) } catch { return null }
}

// ── Email verification ─────────────────────────────────────────

export async function setVerificationToken(token: string, data: { userId: string; email: string }): Promise<void> {
  await redisSetEx(`verify:${token}`, JSON.stringify(data), 15 * 60)
}

export async function getVerificationToken(token: string): Promise<{ userId: string; email: string } | null> {
  const key = `verify:${token}`
  const raw = await redisGet(key)
  if (!raw) return null
  try { await redisDel(key); return JSON.parse(raw) } catch { return null }
}
