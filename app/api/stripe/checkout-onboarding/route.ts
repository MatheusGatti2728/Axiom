// ================================================================
// AXIOM -- Checkout for onboarding flow (no prior session needed)
// Creates user, logs in, creates Stripe checkout in one flow
// ================================================================

import { NextRequest, NextResponse } from "next/server"
import { dbSaveUser, dbGetUserByEmail } from "@/lib/auth/db"
import { getPlans } from "@/lib/auth/plans"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      planId,
      name, email, password,
      phone, cpf, operacao, volume, foco, usuarios,
    } = body

    if (!email || !password || !name || !planId) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 })
    }

    const plans = getPlans()
    if (!plans[planId as keyof typeof plans]) {
      return NextResponse.json({ error: "Plano invalido." }, { status: 400 })
    }

    // 1. Ensure user exists (create or get existing)
    let user = await dbGetUserByEmail(email)
    if (!user) {
      const bcrypt         = await import("bcryptjs")
      const { randomUUID } = await import("crypto")
      const passwordHash   = await bcrypt.hash(password, 12)

      user = {
        id:                 randomUUID(),
        email:              email.toLowerCase().trim(),
        name:               name.trim(),
        passwordHash,
        subscriptionStatus: "inactive",
        planId:             planId,
        createdAt:          new Date().toISOString(),
        onboarding: {
          phone, cpf, operacao, volume, foco, usuarios,
        } as any,
      }
      await dbSaveUser(user)
    }

    // 2. Store temp login token for post-payment auto-login
    const { randomUUID } = await import("crypto")
    const { setTempLoginToken } = await import("@/lib/auth/db")
    const loginToken = randomUUID().replace(/-/g, "")
    await setTempLoginToken(loginToken, { email: user.email, password })

    // 3. Create Stripe checkout session
    const { createCheckoutSession } = await import("@/lib/auth/stripe")
    const baseUrl = process.env.NEXTAUTH_URL ?? req.nextUrl.origin

    const url = await createCheckoutSession({
      email:      user.email,
      userId:     user.id,
      planId,
      successUrl: `${baseUrl}/bem-vindo?token=${loginToken}&plano=${planId}`,
      cancelUrl:  `${baseUrl}/planos?cancelado=true`,
    })

    return NextResponse.json({ url, userId: user.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[/api/stripe/checkout-onboarding]", msg)
    return NextResponse.json({ error: "Erro ao iniciar checkout: " + msg }, { status: 500 })
  }
}
