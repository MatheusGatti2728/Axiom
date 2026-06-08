// ================================================================
// AXIOM -- Stripe customer portal
// ================================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createPortalSession } from "@/lib/auth/stripe"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "Sem assinatura ativa." }, { status: 400 })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? req.nextUrl.origin
    const url = await createPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl:  `${baseUrl}/conta`,
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error("[/api/stripe/portal]", err)
    return NextResponse.json({ error: "Erro ao abrir portal." }, { status: 500 })
  }
}
