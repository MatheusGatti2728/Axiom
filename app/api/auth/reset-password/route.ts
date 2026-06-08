import { NextRequest, NextResponse } from "next/server"
import { dbGetUserByEmail, dbGetAllUsers, dbSaveUser } from "@/lib/auth/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 8 caracteres." }, { status: 400 })
    }

    // Find user with this reset token
    const users = await dbGetAllUsers()
    const user  = users.find((u: any) => u.resetToken === token)

    if (!user) {
      return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 })
    }

    const expiry = (user as any).resetTokenExpiry ?? 0
    if (Date.now() > expiry) {
      return NextResponse.json({ error: "Link expirado. Solicite um novo." }, { status: 400 })
    }

    const bcrypt  = await import("bcryptjs")
    const newHash = await bcrypt.hash(newPassword, 12)

    const updated = { ...user, passwordHash: newHash }
    delete (updated as any).resetToken
    delete (updated as any).resetTokenExpiry
    await dbSaveUser(updated)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[reset-password]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
