import { NextRequest, NextResponse } from "next/server"
import { dbGetUserByEmail, dbSaveUser } from "@/lib/auth/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-admin-secret")
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Nao autorizado." }, { status: 401 })
    }

    const { email, newPassword } = await req.json()
    if (!email || !newPassword) {
      return NextResponse.json({ error: "email e newPassword obrigatorios." }, { status: 400 })
    }

    const user = await dbGetUserByEmail(email.toLowerCase().trim())
    if (!user) {
      return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 })
    }

    const bcrypt  = await import("bcryptjs")
    const newHash = await bcrypt.hash(newPassword, 12)

    await dbSaveUser({ ...user, passwordHash: newHash })

    return NextResponse.json({ ok: true, msg: `Senha redefinida para: ${email}` })
  } catch (err) {
    console.error("[admin/reset-password]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
