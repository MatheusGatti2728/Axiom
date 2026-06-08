import { NextRequest, NextResponse } from "next/server"
import { getTempLoginToken } from "@/lib/auth/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")
    if (!token) {
      return NextResponse.json({ error: "Token ausente." }, { status: 400 })
    }
    const data = await getTempLoginToken(token)
    if (!data) {
      return NextResponse.json({ error: "Token invalido ou expirado." }, { status: 404 })
    }
    return NextResponse.json({ email: data.email, password: data.password })
  } catch (err) {
    console.error("[temp-login]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
