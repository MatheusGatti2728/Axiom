"use client"
import React, { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function RedefinirContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token  = params.get("token") ?? ""
  const [pass,    setPass]    = useState("")
  const [pass2,   setPass2]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [done,    setDone]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pass !== pass2) { setError("As senhas não coincidem."); return }
    if (pass.length < 8) { setError("Mínimo 8 caracteres."); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, newPassword: pass }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erro ao redefinir."); return }
      setDone(true)
      setTimeout(() => router.push("/login"), 2500)
    } catch { setError("Erro de conexão.") }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", color: "var(--ink-1)", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="5" fill="var(--v)" /><text x="10" y="14" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui">A</text></svg>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em" }}>AXIOM</span>
        </div>
        {!token ? (
          <>
            <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>Link inválido.</p>
            <a href="/esqueci-senha" style={{ fontSize: 13, color: "var(--v)", textDecoration: "none" }}>Solicitar novo link →</a>
          </>
        ) : done ? (
          <>
            <p style={{ fontSize: 11, color: "var(--green)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Senha redefinida</p>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 12 }}>Tudo certo.</h1>
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Redirecionando para o login...</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Nova senha</p>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 48 }}>Criar nova senha</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div><label style={lbl}>Nova senha</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Mínimo 8 caracteres" disabled={loading} style={inp} /></div>
              <div><label style={lbl}>Confirmar</label><input type="password" value={pass2} onChange={e => setPass2(e.target.value)} placeholder="Repita a senha" disabled={loading} style={inp} /></div>
              {error && <p style={{ fontSize: 12, color: "var(--red)" }}>{error}</p>}
              <button type="submit" disabled={loading || !pass || !pass2} style={{ padding: "11px 0", background: loading || !pass || !pass2 ? "rgba(79,70,229,0.15)" : "var(--v)", color: loading || !pass || !pass2 ? "var(--ink-3)" : "#fff", border: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", cursor: loading || !pass || !pass2 ? "not-allowed" : "pointer" }}>
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`input::placeholder { color: #1A2332; } input:focus { border-color: rgba(79,70,229,0.3) !important; outline: none !important; }`}</style>
    </div>
  )
}
export default function RedefinirSenhaPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--canvas)" }} />}><RedefinirContent /></Suspense>
}
const lbl: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 600, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }
const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box" as const, background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--ink-1)", fontFamily: "'Inter',sans-serif", fontSize: 14, padding: "8px 0", outline: "none", transition: "border-color 150ms" }
