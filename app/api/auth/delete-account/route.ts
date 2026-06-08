import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { dbGetUser, dbSaveUser } from "@/lib/auth/db"

export const dynamic = "force-dynamic"

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId  = (session?.user as any)?.id as string | undefined
    if (!session || !userId) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const user = await dbGetUser(userId)
    if (!user) {
      return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 })
    }

    // Cancel Stripe subscription if active
    if (user.subscriptionId && user.subscriptionStatus === "active") {
      try {
        const { getStripe } = await import("@/lib/auth/stripe")
        const stripe = getStripe()
        await stripe.subscriptions.cancel(user.subscriptionId)
      } catch (stripeErr) {
        console.error("[delete-account] stripe cancel failed:", stripeErr)
      }
    }

    // Mark as deleted (soft delete - keep for 90 days per LGPD)
    await dbSaveUser({
      ...user,
      subscriptionStatus: "canceled",
      deletedAt: new Date().toISOString(),
      email: `deleted_${Date.now()}_${user.email}`,
      name: "Conta excluída",
      passwordHash: "",
    } as any)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[delete-account]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
