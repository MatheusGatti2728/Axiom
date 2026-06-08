import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail } from "@/lib/auth/users"
import { dbSaveUser } from "@/lib/auth/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, phone, cpf, operacao, volume, foco, usuarios } = body ?? {}

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 })
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 8 caracteres." }, { status: 400 })
    }

    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "Este e-mail ja esta cadastrado." }, { status: 409 })
    }

    const { randomUUID } = await import("crypto")
    const passwordHash    = await bcrypt.hash(password, 12)

    const userId = randomUUID()
    await dbSaveUser({
      id:                 userId,
      email:              email.toLowerCase().trim(),
      name:               name.trim(),
      passwordHash,
      subscriptionStatus: "inactive",
      planId:             "core",
      createdAt:          new Date().toISOString(),
      onboarding: {
        phone:       phone    ?? "",
        cpf:         cpf      ?? "",
        operacao:    operacao ?? "",
        volume:      volume   ?? "",
        foco:        foco     ?? "",
        usuarios:    usuarios ?? "",
      } as any,
    })

    // Send verification email (non-blocking - don't fail if email fails)
    try {
      const { createVerificationToken, sendVerificationEmail } = await import("@/lib/auth/email")
      const baseUrl = process.env.NEXTAUTH_URL ?? "https://axiom-ozpf.vercel.app"
      const vToken  = await createVerificationToken(user.id, user.email)
      sendVerificationEmail(user.email, user.name, vToken, baseUrl) // fire-and-forget
    } catch (emailErr) {
      console.error("[register] email send failed:", emailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/auth/register]", err)
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 })
  }
}
