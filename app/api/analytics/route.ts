import { NextRequest, NextResponse } from "next/server"
import { dbGetAllUsers } from "@/lib/auth/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get("x-admin-secret")
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Nao autorizado." }, { status: 401 })
    }

    const users = await dbGetAllUsers()
    const now   = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

    // Metrics
    const total       = users.length
    const active      = users.filter(u => u.subscriptionStatus === "active" || u.subscriptionStatus === "trialing").length
    const inactive    = users.filter(u => u.subscriptionStatus === "inactive").length
    const canceled    = users.filter(u => u.subscriptionStatus === "canceled").length
    const internal    = users.filter(u => u.internalAccess).length
    const paying      = active - internal

    // Revenue estimate
    const revenueMap: Record<string, number> = {
      core:         11990,
      intelligence: 19790,
      operations:   49790,
      alphaville:   9700,
      enterprise:   0,
    }
    const mrr = users
      .filter(u => !u.internalAccess && (u.subscriptionStatus === "active" || u.subscriptionStatus === "trialing"))
      .reduce((sum, u) => sum + (revenueMap[u.planId ?? "core"] ?? 0), 0)

    // Usage this month
    const totalUsageThisMonth = users.reduce((sum, u) => {
      return sum + ((u.usageByMonth ?? {})[month] ?? 0)
    }, 0)

    // Plan distribution
    const byPlan = users.reduce((acc, u) => {
      if (!u.internalAccess && u.subscriptionStatus === "active") {
        acc[u.planId ?? "core"] = (acc[u.planId ?? "core"] ?? 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Recent signups (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentSignups = users.filter(u => {
      return u.createdAt && new Date(u.createdAt).getTime() > sevenDaysAgo
    }).length

    // Top users by usage
    const topUsers = users
      .filter(u => (u.usageByMonth ?? {})[month] > 0)
      .sort((a, b) => ((b.usageByMonth ?? {})[month] ?? 0) - ((a.usageByMonth ?? {})[month] ?? 0))
      .slice(0, 10)
      .map(u => ({
        name:  u.name,
        email: u.email,
        plan:  u.planId ?? "core",
        usage: (u.usageByMonth ?? {})[month] ?? 0,
      }))

    return NextResponse.json({
      snapshot: {
        total_users:        total,
        paying_users:       paying,
        internal_users:     internal,
        inactive_users:     inactive,
        canceled_users:     canceled,
        mrr_cents:          mrr,
        mrr_display:        `R$ ${(mrr / 100).toFixed(2).replace(".", ",")}`,
        analyses_this_month: totalUsageThisMonth,
        new_users_7d:       recentSignups,
      },
      by_plan:   byPlan,
      top_users: topUsers,
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[analytics]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
