// ================================================================
// AXIOM -- Usage API (for account page meter)
// ================================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUsageSummary } from "@/lib/auth/usage"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId  = (session?.user as any)?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
    }

    const summary = await getUsageSummary(userId)
    return NextResponse.json(summary)
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
