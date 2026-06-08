// ================================================================
// AXIOM -- Save onboarding profile data
// ================================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions }  from "@/app/api/auth/[...nextauth]/route"
import { dbGetUser, dbSaveUser } from "@/lib/auth/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId  = (session?.user as any)?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const user = await dbGetUser(userId)
    if (!user) {
      return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 })
    }

    const body = await req.json()
    const { role, company, segment, volume, phone } = body

    await dbSaveUser({
      ...user,
      onboarding: {
        role:        role     ?? user.onboarding?.role,
        company:     company  ?? user.onboarding?.company,
        segment:     segment  ?? user.onboarding?.segment,
        volume:      volume   ?? user.onboarding?.volume,
        phone:       phone    ?? user.onboarding?.phone,
        completedAt: new Date().toISOString(),
      },
      onboardingDone: true,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/onboarding]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
