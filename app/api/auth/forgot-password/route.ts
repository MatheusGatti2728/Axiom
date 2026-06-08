import { NextRequest, NextResponse } from "next/server"
import { dbGetUserByEmail, dbSaveUser } from "@/lib/auth/db"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 })

    const user = await dbGetUserByEmail(email.toLowerCase().trim())

    // Always return success to avoid email enumeration
    if (!user) return NextResponse.json({ ok: true })

    const token     = randomUUID().replace(/-/g, "")
    const expiresAt = Date.now() + 30 * 60 * 1000 // 30 min

    await dbSaveUser({ ...user, resetToken: token, resetTokenExpiry: expiresAt } as any)

    const baseUrl  = process.env.NEXTAUTH_URL ?? "https://axiom-ozpf.vercel.app"
    const resetUrl = `${baseUrl}/redefinir-senha?token=${token}`

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from:    "AXIOM Tax Intelligence <noreply@grupostrategi.com.br>",
          to:      [user.email],
          subject: "Redefinição de senha — AXIOM",
          html: `
            <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#05080F;color:#F1F5F9">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px">
                <div style="width:28px;height:28px;background:linear-gradient(135deg,#4338CA,#6D28D9);border-radius:7px;display:flex;align-items:center;justify-content:center">
                  <span style="color:#fff;font-size:14px;font-weight:800">A</span>
                </div>
                <span style="font-size:16px;font-weight:700;letter-spacing:-0.02em">AXIOM Tax Intelligence</span>
              </div>
              <h1 style="font-size:22px;font-weight:700;margin-bottom:12px;letter-spacing:-0.02em">Redefinição de senha</h1>
              <p style="color:#64748B;font-size:14px;line-height:1.7;margin-bottom:28px">
                Recebemos uma solicitação para redefinir a senha da sua conta AXIOM.<br>
                Clique no botão abaixo para criar uma nova senha. O link expira em 30 minutos.
              </p>
              <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#4F46E5;border-radius:8px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;margin-bottom:28px">
                Redefinir senha →
              </a>
              <p style="color:#334155;font-size:12px;line-height:1.6">
                Se você não solicitou a redefinição, ignore este e-mail.<br>
                Sua senha permanece a mesma.
              </p>
              <hr style="border:none;border-top:1px solid #0F172A;margin:24px 0">
              <p style="color:#1E293B;font-size:11px">AXIOM Tax Intelligence — Grupo Strategi</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[forgot-password]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
