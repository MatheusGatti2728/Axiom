import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { dbGetUser, dbSaveUser } from "@/lib/auth/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId  = (session?.user as any)?.id as string | undefined
    if (!session || !userId) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }
    const user = await dbGetUser(userId)
    if (!user) return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 })
    await dbSaveUser({ ...user, tourCompleted: true } as any)
    const res = NextResponse.json({ ok: true })
    // Set a short-lived cookie so middleware lets the user through
    // while the JWT refreshes (NextAuth session update takes 1-2 requests)
    res.cookies.set("axiom_tour_done", "1", {
      maxAge: 60, // 60 seconds — enough for the redirect
      httpOnly: false,
      path: "/",
    })
    return res
  } catch (err) {
    console.error("[tour/complete]", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
