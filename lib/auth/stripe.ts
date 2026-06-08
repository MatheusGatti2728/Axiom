// ================================================================
// AXIOM -- Stripe helpers (v2 - multi-plan)
// ================================================================

import Stripe from "stripe"
import { getPlans, getPlanByStripePrice } from "./plans"

// Lazy initialization - does not throw at build time
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(key, { apiVersion: "2024-06-20" })
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  },
})

export async function createCheckoutSession({
  email,
  userId,
  planId,
  successUrl,
  cancelUrl,
}: {
  email:      string
  userId:     string
  planId:     string
  successUrl: string
  cancelUrl:  string
}): Promise<string> {
  const s = getStripe()
  const plans = getPlans()
  const plan = plans[planId as keyof typeof plans] ?? plans.core

  if (!plan.stripePriceId) {
    throw new Error(`Stripe Price ID not configured for plan: ${planId}`)
  }

  const session = await s.checkout.sessions.create({
    mode:                 "subscription",
    payment_method_types: ["card"],
    customer_email:       email,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    metadata:             { userId, planId },
    success_url:          successUrl,
    cancel_url:           cancelUrl,
    locale:               "pt-BR",
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 7,
      metadata:          { userId, planId },
    },
  })

  return session.url!
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl:  string
}): Promise<string> {
  const s = getStripe()
  const session = await s.billingPortal.sessions.create({
    customer:   customerId,
    return_url: returnUrl,
  })
  return session.url
}

export { getPlanByStripePrice }
