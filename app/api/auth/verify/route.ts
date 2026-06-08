import { NextRequest, NextResponse } from "next/server"
import { validateVerificationToken } from "@/lib/auth/email"
import { dbGetUser, dbSaveUser } from "@/lib/auth/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")
    if (!token) {
      return NextResponse.redirect(new URL("/login?error=token_missing", req.url))
    }
    const data = await validateVerificationToken(token)
    if (!data) {
      return NextResponse.redirect(new URL("/login?verified=expired", req.url))
    }
    const user = await dbGetUser(data.userId)
    if (!user) {
      return NextResponse.redirect(new URL("/login?error=user_not_found", req.url))
    }
    await dbSaveUser({ ...user, emailVerified: true } as any)
    return NextResponse.redirect(new URL("/login?verified=true", req.url))
  } catch (err) {
    console.error("[verify]", err)
    return NextResponse.redirect(new URL("/login?error=server_error", req.url))
  }
}
