"use client"

import React, { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [email,   setEmail]   = useState("")
  const [pass,    setPass]    = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [msg,     setMsg]     = useState("")
  const [tick,    setTick]    = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTick(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const motivo = params.get("motivo")
    const pago   = params.get("pago")
    if (motivo === "sessao_encerrada") setError("Sessão encerrada — acesso simultâneo detectado.")
    else if (pago === "true")          setMsg("Pagamento confirmado. Acesse sua conta.")
    else if (params.get("error"))      window.history.replaceState({}, "", "/login")
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !pass) return
    setLoading(true); setError("")
    const result = await signIn("credentials", { email, password: pass, redirect: false })
    if (!result?.ok || result?.error) {
      setError("E-mail ou senha incorretos.")
      setLoading(false)
      return
    }
    router.push("/dashboard")
  }

  const hh  = tick.getHours().toString().padStart(2, "0")
  const mm  = tick.getMinutes().toString().padStart(2, "0")
  const ss  = tick.getSeconds().toString().padStart(2, "0")
  const dow = tick.toLocaleDateString("pt-BR", { weekday: "long" })
  const dat = tick.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* ── LEFT — Brand panel ──────────────────────────── */}
      <div className="ax-login-left" style={{
        width: 460, flexShrink: 0,
        background: "var(--side-bg)",
        display: "flex", flexDirection: "column" as const,
        justifyContent: "space-between",
        padding: "48px 52px",
        position: "relative" as const,
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute" as const, bottom: 0, left: 0, right: 0, height: 280, background: "linear-gradient(to top, rgba(79,70,229,0.04), transparent)", pointerEvents: "none" }} />

        {/* Wordmark + clock */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "var(--side-text-1)", marginBottom: 4 }}>AXIOM</p>
            <p style={{ fontSize: 11, color: "var(--side-text-3)", letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Tax Intelligence</p>
          </div>
          <div style={{ textAlign: "right" as const }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "var(--side-text-3)", letterSpacing: "0.06em" }}>{hh}:{mm}:{ss}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)" }} />
              <p style={{ fontSize: 11, color: "var(--side-text-3)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Online</p>
            </div>
          </div>
        </div>

        {/* Main statement */}
        <div>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--side-text-3)", letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 24 }}>
            Plataforma corporativa
          </p>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 44, fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.045em", color: "var(--side-text-1)", marginBottom: 20 }}>
            Inteligência<br />tributária<br />estratégica.
          </h1>
          <div style={{ width: 28, height: 1, background: "var(--v)", opacity: 0.5, marginBottom: 20 }} />
          <p style={{ fontSize: 14, color: "var(--side-text-3)", lineHeight: 1.85, maxWidth: 320 }}>
            Dossiê completo por CNPJ em menos de 60 segundos. Oportunidades, decisores, histórico jurídico e playbook — gerados em tempo real.
          </p>
        </div>

        {/* Data points */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px", marginBottom: 32 }}>
            {[
              { v: "< 60s", l: "por dossiê completo" },
              { v: "6",     l: "camadas de inteligência" },
              { v: "99.9%", l: "disponibilidade" },
              { v: "LGPD",  l: "em conformidade" },
            ].map(({ v, l }) => (
              <div key={v}>
                <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, color: "var(--side-text-2)", letterSpacing: "-0.03em", marginBottom: 4 }}>{v}</p>
                <p style={{ fontSize: 12, color: "var(--side-text-3)" }}>{l}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.08)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            SSL 256-bit · AES-256 · LGPD · SOC 2
          </p>
        </div>
      </div>

      {/* ── RIGHT — Form ────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 80px", background: "var(--canvas)",
      }}>
        <div style={{ width: "100%", maxWidth: 320 }}>

          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--ink-5)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 52 }}>
            {dow}, {dat}
          </p>

          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.04em", marginBottom: 8 }}>
            Acessar plataforma
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-4)", marginBottom: 40, lineHeight: 1.6 }}>
            Acesso restrito a usuários autorizados.
          </p>

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>

            <div>
              <label htmlFor="email" style={lbl}>E-mail corporativo</label>
              <input
                id="email" type="email" value={email} autoComplete="email"
                onChange={e => { setEmail(e.target.value); setError("") }}
                placeholder="nome@empresa.com.br" disabled={loading}
                aria-label="E-mail corporativo" style={inp}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label htmlFor="senha" style={{ ...lbl, marginBottom: 0 }}>Senha</label>
                <a href="/esqueci-senha" style={{ fontSize: 12, color: "var(--v)", textDecoration: "none", fontWeight: 500 }}>
                  Esqueci minha senha
                </a>
              </div>
              <input
                id="senha" type="password" value={pass} autoComplete="current-password"
                onChange={e => { setPass(e.target.value); setError("") }}
                placeholder="••••••••••••" disabled={loading}
                aria-label="Senha" style={inp}
              />
            </div>

            {msg && !error && (
              <p role="status" style={{ fontSize: 13, color: "var(--green)", lineHeight: 1.5 }}>{msg}</p>
            )}
            {error && (
              <p role="alert" style={{ fontSize: 13, color: "var(--red)", lineHeight: 1.5 }}>{error}</p>
            )}

            <button
              type="submit" disabled={loading || !email || !pass}
              aria-label="Entrar na plataforma"
              style={{
                width: "100%", padding: "12px 0", border: "none", marginTop: 4,
                background: loading || !email || !pass ? "var(--lift)" : "var(--v)",
                color: loading || !email || !pass ? "var(--ink-5)" : "#fff",
                fontSize: 13, fontWeight: 600,
                fontFamily: "'Space Grotesk',sans-serif",
                letterSpacing: "-0.01em",
                cursor: loading || !email || !pass ? "not-allowed" : "pointer",
                transition: "all 150ms",
              } as React.CSSProperties}
            >
              {loading ? "Autenticando..." : "Acessar plataforma"}
            </button>
          </form>

          <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--rule)" }}>
            <p style={{ fontSize: 13, color: "var(--ink-5)", marginBottom: 8 }}>Não tem acesso?</p>
            <a href="/cadastro" style={{ fontSize: 13, color: "var(--v)", textDecoration: "none", fontWeight: 500 }}>
              Solicitar acesso à plataforma →
            </a>
          </div>

          <p style={{ marginTop: 32, fontSize: 12, color: "var(--rule-strong)" }}>
            Conexão SSL · LGPD · SOC 2
          </p>
        </div>
      </div>

      <style>{`
        .ax-login-left { display: flex !important; }
        input::placeholder { color: var(--ink-5); }
        input:focus { border-color: var(--v) !important; box-shadow: 0 0 0 3px var(--v-wash) !important; outline: none !important; }
        @media (max-width: 860px) { .ax-login-left { display: none !important; } }
      `}</style>
    </div>
  )
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--ink-3)", marginBottom: 8, letterSpacing: "0.01em",
}
const inp: React.CSSProperties = {
  width: "100%", boxSizing: "border-box" as const,
  background: "var(--white)", border: "1px solid var(--rule-mid)",
  color: "var(--ink-1)", fontFamily: "'Inter',sans-serif",
  fontSize: 14, padding: "10px 14px", outline: "none",
  transition: "border-color 150ms, box-shadow 150ms",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--side-bg)" }} />}>
      <LoginContent />
    </Suspense>
  )
}
