// ================================================================
// AXIOM -- Admin: Grant internal access to team members
// Protected by ADMIN_SECRET env var
// Usage: POST /api/admin/grant-access
// ================================================================

import { NextRequest, NextResponse } from "next/server"
import { dbGetUserByEmail, dbSaveUser } from "@/lib/auth/db"
import { randomUUID } from "crypto"

export async function POST(req: NextRequest) {
  try {
    // Verify admin secret
    const secret = req.headers.get("x-admin-secret")
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Nao autorizado." }, { status: 401 })
    }

    const body = await req.json()
    const { email, name, note, action } = body

    // action: "grant" | "revoke" | "create"
    if (!email) {
      return NextResponse.json({ error: "E-mail obrigatorio." }, { status: 400 })
    }

    let user = await dbGetUserByEmail(email)

    if (action === "revoke") {
      if (!user) return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 })
      await dbSaveUser({ ...user, internalAccess: false, role: "user" })
      return NextResponse.json({ ok: true, msg: `Acesso interno revogado: ${email}` })
    }

    if (!user && action === "create") {
      // Create account without password (they'll need to reset)
      const bcrypt = await import("bcryptjs")
      const tempPass = randomUUID().slice(0, 12)
      const passwordHash = await bcrypt.hash(tempPass, 12)

      user = {
        id:                 randomUUID(),
        email:              email.toLowerCase().trim(),
        name:               name?.trim() ?? email.split("@")[0],
        passwordHash,
        subscriptionStatus: "active",
        planId:             "intelligence", // internal gets Intelligence
        createdAt:          new Date().toISOString(),
        internalAccess:     true,
        role:               "internal",
        internalNote:       note ?? "",
      }
      await dbSaveUser(user)
      return NextResponse.json({
        ok: true,
        msg: `Conta interna criada: ${email}`,
        tempPassword: tempPass,
        note: "Envie a senha temporaria para o membro da equipe. Ele podera alterar no primeiro acesso.",
      })
    }

    if (!user) {
      return NextResponse.json({
        error: "Usuario nao encontrado. Use action='create' para criar uma nova conta.",
      }, { status: 404 })
    }

    // Grant internal access to existing user
    await dbSaveUser({
      ...user,
      subscriptionStatus: "active",
      planId:             user.planId ?? "intelligence",
      internalAccess:     true,
      role:               "internal",
      internalNote:       note ?? user.internalNote ?? "",
    })

    return NextResponse.json({
      ok:   true,
      msg:  `Acesso interno concedido: ${email}`,
      user: { id: user.id, email: user.email, name: user.name },
    })

  } catch (err) {
    console.error("[/api/admin/grant-access]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}

// List all internal users
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret")
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 })
  }

  try {
    const { dbGetAllUsers } = await import("@/lib/auth/db")
    const all      = await dbGetAllUsers()
    const internal = all
      .filter(u => u.internalAccess)
      .map(u => ({
        id:    u.id,
        email: u.email,
        name:  u.name,
        role:  u.role,
        note:  u.internalNote ?? "",
        since: u.createdAt,
      }))

    return NextResponse.json({ internal, total: internal.length })
  } catch (err) {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
