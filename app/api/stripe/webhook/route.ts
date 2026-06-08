// ================================================================
// AXIOM -- Stripe webhook handler
// ================================================================

import { NextRequest, NextResponse } from "next/server"
import { stripe }              from "@/lib/auth/stripe"
import { getPlanByStripePrice } from "@/lib/auth/plans"
import { dbGetUser, dbGetUserByStripeId, dbSaveUser } from "@/lib/auth/db"
import type { AxiomUser } from "@/lib/auth/db"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("stripe-signature") ?? ""

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "")
  } catch (err) {
    console.error("[webhook] bad signature", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log(`[webhook] ${event.type}`)

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const sess   = event.data.object as Stripe.Checkout.Session
        const userId = sess.metadata?.userId
        const planId = sess.metadata?.planId ?? "core"
        if (!userId) break

        const user = await dbGetUser(userId)
        if (!user) break

        const updatedUser = {
          ...user,
          stripeCustomerId:   sess.customer as string,
          subscriptionId:     sess.subscription as string,
          subscriptionStatus: "active" as const,
          planId,
        }
        await dbSaveUser(updatedUser)
        console.log(`[webhook] activated ${userId} on ${planId}`)

        // Send welcome email
        try {
          const resendKey = process.env.RESEND_API_KEY
          const baseUrl   = process.env.NEXTAUTH_URL ?? "https://axiom-ozpf.vercel.app"
          if (resendKey && user.email) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from:    "AXIOM Tax Intelligence <noreply@grupostrategi.com.br>",
                to:      [user.email],
                subject: "Bem-vindo ao AXIOM Tax Intelligence",
                html: `<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#05080F;color:#F1F5F9"><div style="display:flex;align-items:center;gap:8px;margin-bottom:32px"><div style="width:28px;height:28px;background:linear-gradient(135deg,#4338CA,#6D28D9);border-radius:7px;display:flex;align-items:center;justify-content:center"><span style="color:#fff;font-size:14px;font-weight:800">A</span></div><span style="font-size:16px;font-weight:700">AXIOM Tax Intelligence</span></div><h1 style="font-size:24px;font-weight:700;margin-bottom:12px">Seu acesso esta ativo!</h1><p style="color:#64748B;font-size:14px;line-height:1.8;margin-bottom:24px">Ola, <strong style="color:#F1F5F9">${user.name}</strong>! Seja bem-vindo ao AXIOM.<br>Sua assinatura foi confirmada e seu ambiente ja esta pronto.</p><a href="${baseUrl}/dashboard" style="display:inline-block;padding:12px 28px;background:#4F46E5;border-radius:8px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;margin-bottom:32px">Acessar plataforma</a><p style="color:#334155;font-size:12px">AXIOM Tax Intelligence - Grupo Strategi</p></div>`,
              }),
            })
          }
        } catch (emailErr) {
          console.error("[webhook] welcome email failed:", emailErr)
        }
        break
      }

      case "customer.subscription.updated": {
        const sub  = event.data.object as Stripe.Subscription
        const user = await dbGetUserByStripeId(sub.customer as string)
        if (!user) break

        const priceId   = sub.items.data[0]?.price?.id
        const newPlan   = priceId ? getPlanByStripePrice(priceId) : null
        const planId    = newPlan?.id ?? user.planId ?? "core"

        await dbSaveUser({
          ...user,
          subscriptionStatus: mapStatus(sub.status),
          subscriptionId:     sub.id,
          planId,
        })
        break
      }

      case "customer.subscription.deleted": {
        const sub  = event.data.object as Stripe.Subscription
        const user = await dbGetUserByStripeId(sub.customer as string)
        if (!user) break
        await dbSaveUser({ ...user, subscriptionStatus: "canceled" })
        break
      }

      case "invoice.payment_failed": {
        const inv  = event.data.object as Stripe.Invoice
        const user = await dbGetUserByStripeId(inv.customer as string)
        if (!user) break
        await dbSaveUser({ ...user, subscriptionStatus: "inactive" })
        break
      }
    }
  } catch (err) {
    console.error("[webhook] error", err)
  }

  return NextResponse.json({ received: true })
}

function mapStatus(s: Stripe.Subscription.Status): AxiomUser["subscriptionStatus"] {
  switch (s) {
    case "active":   return "active"
    case "trialing": return "trialing"
    case "canceled": return "canceled"
    default:         return "inactive"
  }
}
