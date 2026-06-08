"use client"
import React, { useState } from "react"

export default function EsqueciSenhaPage() {
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true); setError("")
    try {
      await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
      setSent(true)
    } catch { setError("Erro de conexão. Tente novamente.") }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", color: "var(--ink-1)", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="5" fill="var(--v)" />
            <text x="10" y="14" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui">A</text>
          </svg>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em" }}>AXIOM</span>
        </div>

        {sent ? (
          <>
            <p style={{ fontSize: 11, color: "var(--green)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>E-mail enviado</p>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 12 }}>Verifique sua caixa de entrada</h1>
            <p style={{ fontSize: 13, color: "var(--ink-4)", lineHeight: 1.7, marginBottom: 40 }}>Se este e-mail estiver cadastrado, você receberá as instruções em instantes. O link expira em 30 minutos.</p>
            <a href="/login" style={{ fontSize: 13, color: "var(--v)", textDecoration: "none" }}>← Voltar para o login</a>
          </>
        ) : (
          <>
            <p style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Recuperar acesso</p>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 12 }}>Redefinir senha</h1>
            <p style={{ fontSize: 13, color: "var(--ink-4)", marginBottom: 48, lineHeight: 1.6 }}>Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <label style={lbl}>E-mail corporativo</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@empresa.com.br" disabled={loading} style={inp} />
              </div>
              {error && <p style={{ fontSize: 12, color: "var(--red)" }}>{error}</p>}
              <button type="submit" disabled={loading || !email} style={{ padding: "11px 0", background: loading || !email ? "rgba(79,70,229,0.15)" : "var(--v)", color: loading || !email ? "var(--ink-3)" : "#fff", border: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", cursor: loading || !email ? "not-allowed" : "pointer", transition: "all 150ms" }}>
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <a href="/login" style={{ fontSize: 12, color: "var(--ink-4)", textDecoration: "none" }}>← Voltar para o login</a>
            </div>
          </>
        )}
      </div>
      <style>{`input::placeholder { color: #1A2332; } input:focus { border-color: rgba(79,70,229,0.3) !important; outline: none !important; } button:not(:disabled):hover { filter: brightness(1.1); }`}</style>
    </div>
  )
}
const lbl: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 600, color: "var(--ink-4)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }
const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box" as const, background: "transparent", border: "none", border: "1px solid #E2E8F0", color: "var(--ink-1)", fontFamily: "'Inter',sans-serif", fontSize: 14, padding: "8px 0", outline: "none", transition: "border-color 150ms" }
