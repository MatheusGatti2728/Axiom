import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const { prompt } = await req.json()
    if (!prompt) {
      return NextResponse.json({ error: "Prompt ausente." }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error("[email/generate] ANTHROPIC_API_KEY not set")
      return NextResponse.json({ error: "Servico de IA nao configurado. Contate o suporte." }, { status: 503 })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages:   [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[email/generate] Anthropic error:", response.status, errText)
      
      // Parse error for better user message
      let userMsg = "Servico de IA indisponivel. Tente novamente em instantes."
      try {
        const errJson = JSON.parse(errText)
        if (errJson?.error?.type === "authentication_error") {
          userMsg = "Chave de API invalida. Contate o suporte."
        } else if (errJson?.error?.type === "insufficient_quota") {
          userMsg = "Creditos de IA esgotados. Contate o suporte."
        } else if (response.status === 404) {
          userMsg = "Modelo de IA nao encontrado. Contate o suporte."
        }
      } catch {}
      
      return NextResponse.json({ error: userMsg, debug: response.status }, { status: 502 })
    }

    const data = await response.json()
    const text = data.content?.map((c: any) => c.text || "").join("") ?? ""
    return NextResponse.json({ text })

  } catch (err) {
    console.error("[email/generate]", err)
    return NextResponse.json({ error: "Erro interno ao gerar e-mail." }, { status: 500 })
  }
}
