import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { dbGetUser, dbSaveUser } from "@/lib/auth/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId  = (session?.user as any)?.id as string | undefined
    if (!session || !userId) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "A nova senha deve ter pelo menos 8 caracteres." }, { status: 400 })
    }

    const user = await dbGetUser(userId)
    if (!user) {
      return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 })
    }

    const bcrypt = await import("bcryptjs")
    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await dbSaveUser({ ...user, passwordHash: newHash })

    return NextResponse.json({ ok: true, msg: "Senha alterada com sucesso." })
  } catch (err) {
    console.error("[change-password]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
