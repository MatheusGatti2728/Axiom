import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
  // Only accessible in development or with secret header
  const secret = req.headers.get("x-debug-secret")
  if (secret !== "axiom-debug-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  return NextResponse.json({
    STRIPE_SECRET_KEY:      process.env.STRIPE_SECRET_KEY ? "SET (" + process.env.STRIPE_SECRET_KEY.slice(0, 7) + "...)" : "NOT SET",
    STRIPE_PRICE_CORE:      process.env.STRIPE_PRICE_CORE ?? "NOT SET",
    STRIPE_PRICE_INTELLIGENCE: process.env.STRIPE_PRICE_INTELLIGENCE ?? "NOT SET",
    STRIPE_PRICE_OPERATIONS: process.env.STRIPE_PRICE_OPERATIONS ?? "NOT SET",
    NEXTAUTH_SECRET:        process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
    NEXTAUTH_URL:           process.env.NEXTAUTH_URL ?? "NOT SET",
    UPSTASH_URL:            process.env.UPSTASH_REDIS_REST_URL ? "SET" : "NOT SET",
    NODE_ENV:               process.env.NODE_ENV,
    ANTHROPIC_API_KEY:     process.env.ANTHROPIC_API_KEY ? "SET" : "NOT SET",
  })
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
