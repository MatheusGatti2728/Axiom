import { NextRequest, NextResponse } from "next/server"
import { dbGetUserByEmail } from "@/lib/auth/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")
    if (!email) return NextResponse.json({ active: false, error: "Email required" })

    const user = await dbGetUserByEmail(email)
    if (!user) return NextResponse.json({ active: false, error: "User not found" })

    const active = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing"
    return NextResponse.json({
      active,
      status: user.subscriptionStatus,
      planId: user.planId,
    })
  } catch (err) {
    console.error("[check-activation]", err)
    return NextResponse.json({ active: false, error: "Internal error" })
  }
}
