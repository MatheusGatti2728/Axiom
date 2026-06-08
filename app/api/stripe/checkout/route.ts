// ================================================================
// AXIOM -- Create Stripe checkout session (multi-plan)
// ================================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createCheckoutSession } from "@/lib/auth/stripe"
import { getPlans } from "@/lib/auth/plans"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const body   = await req.json().catch(() => ({}))
    const planId = body.planId ?? "core"

    if (!getPlans()[planId as keyof ReturnType<typeof getPlans>]) {
      return NextResponse.json({ error: "Plano invalido." }, { status: 400 })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? req.nextUrl.origin

    const url = await createCheckoutSession({
      email:      session.user.email,
      userId:     (session.user as any).id,
      planId,
      successUrl: `${baseUrl}/dashboard?plano=${planId}&ativado=true`,
      cancelUrl:  `${baseUrl}/pricing?cancelado=true`,
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error("[/api/stripe/checkout]", err)
    return NextResponse.json({ error: "Erro ao criar sessao de pagamento." }, { status: 500 })
  }
}
