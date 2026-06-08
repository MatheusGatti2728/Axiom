// ================================================================
// AXIOM -- Usage tracking (async, uses persistent db)
// ================================================================

import { dbGetUser, dbSaveUser } from "./db"
import { getPlan, getMonthKey } from "./plans"

export interface UsageResult {
  allowed:      boolean
  used:         number
  limit:        number
  remaining:    number
  monthKey:     string
  overLimit:    boolean
}

export async function checkUsage(userId: string): Promise<UsageResult> {
  const user     = await dbGetUser(userId)
  const monthKey = getMonthKey()

  if (!user) {
    return { allowed: true, used: 0, limit: 500, remaining: 500, monthKey, overLimit: false }
  }

  const plan      = getPlan(user.planId)
  const used      = user.usageByMonth?.[monthKey] ?? 0
  const limit     = plan.monthlyLimit
  const remaining = Math.max(0, limit - used)
  const allowed   = used < limit * 2   // allow up to 2x (overage billed)
  const overLimit = used > limit

  return { allowed, used, limit, remaining, monthKey, overLimit }
}

export async function incrementUsage(userId: string): Promise<void> {
  const user = await dbGetUser(userId)
  if (!user) return

  const monthKey     = getMonthKey()
  const usageByMonth = { ...(user.usageByMonth ?? {}) }
  usageByMonth[monthKey] = (usageByMonth[monthKey] ?? 0) + 1

  await dbSaveUser({ ...user, usageByMonth })
}

export async function getUsageSummary(userId: string): Promise<{
  used:       number
  limit:      number
  remaining:  number
  pct:        number
  planName:   string
  monthLabel: string
}> {
  const user = await dbGetUser(userId)
  if (!user) return { used: 0, limit: 500, remaining: 500, pct: 0, planName: "Core", monthLabel: "" }

  const plan     = getPlan(user.planId)
  const monthKey = getMonthKey()
  const used     = user.usageByMonth?.[monthKey] ?? 0
  const limit    = plan.monthlyLimit

  const [year, month] = monthKey.split("-")
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
  const monthLabel = `${months[parseInt(month) - 1]} ${year}`

  return {
    used,
    limit,
    remaining:  Math.max(0, limit - used),
    pct:        Math.min(100, Math.round((used / limit) * 100)),
    planName:   plan.name,
    monthLabel,
  }
}
