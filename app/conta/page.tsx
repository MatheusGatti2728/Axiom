"use client"
// ================================================================
// AXIOM -- Account page (v2 - with usage meter + plan info)
// ================================================================

import React, { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

const STATUS = {
  active:   { label: "Ativa",     color: "var(--green)", bg: "rgba(5,150,105,0.1)" },
  trialing: { label: "Trial",     color: "var(--yellow)", bg: "rgba(217,119,6,0.1)" },
  inactive: { label: "Inativa",   color: "var(--red)", bg: "rgba(220,38,38,0.1)" },
  canceled: { label: "Cancelada", color: "var(--ink-4)", bg: "rgba(148,163,184,0.1)" },
} as Record<string, { label: string; color: string; bg: string }>

const PLAN_LABELS: Record<string, string> = {
  core:          "AXIOM Core",
  intelligence:  "AXIOM Intelligence",
  operations:    "AXIOM Operations",
  enterprise:    "AXIOM Enterprise",
}

const PLAN_PRICES: Record<string, string> = {
  core:         "R$ 197/mes",
  intelligence: "R$ 497/mes",
  operations:   "R$ 1.490/mes",
  enterprise:   "Sob consulta",
}

const PLAN_LIMITS: Record<string, number> = {
  core: 500, intelligence: 1200, operations: 5000, enterprise: 999999,
}

function ChangePassword() {
  const [current, setCurrent] = useState("")
  const [next,    setNext]    = useState("")
  const [next2,   setNext2]   = useState("")
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState("")
  const [err,     setErr]     = useState("")

  async function handleChange(e: React.FormEvent) {
    e.preventDefault()
    setMsg(""); setErr("")
    if (next !== next2) { setErr("As novas senhas não coincidem."); return }
    if (next.length < 8) { setErr("A nova senha deve ter pelo menos 8 caracteres."); return }
    setLoading(true)
    try {
      const res  = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (res.ok) { setMsg("Senha alterada com sucesso."); setCurrent(""); setNext(""); setNext2("") }
      else setErr(data.error ?? "Erro ao alterar senha.")
    } catch { setErr("Erro de conexao.") }
    setLoading(false)
  }

  const inpSt: React.CSSProperties = {
    width: "100%", boxSizing: "border-box" as const,
    background: "var(--white)", border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--ink-1)", fontFamily: "'Inter',sans-serif", fontSize: 13,
    padding: "9px 12px", borderRadius: 6, outline: "none",
  }

  return (
    <form onSubmit={handleChange} style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
      {[
        { label: "Senha atual",    val: current, set: setCurrent },
        { label: "Nova senha",     val: next,    set: setNext    },
        { label: "Confirmar nova", val: next2,   set: setNext2   },
      ].map(({ label, val, set }) => (
        <div key={label}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 6 }}>
            {label}
          </label>
          <input type="password" value={val} onChange={e => set(e.target.value)}
            placeholder="••••••••" disabled={loading} style={inpSt} />
        </div>
      ))}
      {err && <p style={{ fontSize: 11, color: "var(--red)" }}>{err}</p>}
      {msg && <p style={{ fontSize: 11, color: "var(--green)" }}>{msg}</p>}
      <button type="submit" disabled={loading || !current || !next || !next2} style={{
        padding: "9px 0", border: "none", borderRadius: 6,
        background: loading || !current || !next || !next2 ? "rgba(79,70,229,0.2)" : "var(--v)",
        color: loading || !current || !next || !next2 ? "var(--ink-4)" : "#fff",
        fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif",
        cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Alterando..." : "Alterar senha"}
      </button>
    </form>
  )
}

function DeleteAccount() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const res  = await fetch("/api/auth/delete-account", { method: "DELETE" })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
        setTimeout(() => { import("next-auth/react").then(m => m.signOut({ callbackUrl: "/login" })) }, 1500)
      }
    } catch { }
    setLoading(false)
  }

  if (done) return <p style={{ fontSize: 13, color: "var(--green)" }}>Conta excluída. Redirecionando...</p>

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--ink-4)", marginBottom: 12, lineHeight: 1.6 }}>
        Ao excluir sua conta, todos os seus dados serão removidos permanentemente.<br/>
        Esta ação não pode ser desfeita.
      </p>
      {!confirm ? (
        <button onClick={() => setConfirm(true)} style={{ fontSize: 12, color: "var(--red)", background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
          Excluir minha conta
        </button>
      ) : (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "var(--red)", margin: 0 }}>Tem certeza?</p>
          <button onClick={handleDelete} disabled={loading} style={{ fontSize: 12, color: "#fff", background: "var(--red)", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
            {loading ? "Excluindo..." : "Sim, excluir"}
          </button>
          <button onClick={() => setConfirm(false)} style={{ fontSize: 12, color: "var(--ink-4)", background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

export default function ContaPage() {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [usage,   setUsage]   = useState<{ used: number; limit: number; pct: number; monthLabel: string } | null>(null)

  useEffect(() => {
    if (!session) return
    fetch("/api/usage").then(r => r.json()).then(setUsage).catch(() => {})
  }, [session])

  if (status === "loading") return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--ink-3)", fontFamily: "'Inter', sans-serif" }}>Carregando...</p>
    </div>
  )

  if (!session) { router.push("/login"); return null }

  const user   = session.user as any
  const sub    = user.subscriptionStatus ?? "inactive"
  const planId = user.planId ?? "core"
  const active = sub === "active" || sub === "trialing"
  const badge  = STATUS[sub] ?? STATUS.inactive

  async function handlePortal() {
    setLoading("portal")
    const res  = await fetch("/api/stripe/portal", { method: "POST" })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  async function handleUpgrade(targetPlan: string) {
    setLoading(targetPlan)
    const res  = await fetch("/api/stripe/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: targetPlan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  const usedPct = usage?.pct ?? 0
  const meterColor = usedPct >= 90 ? "var(--red)" : usedPct >= 70 ? "var(--yellow)" : "var(--green)"

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", fontFamily: "'Inter', sans-serif", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Back */}
        <a href="/dashboard" style={{ fontSize: 12, color: "var(--ink-3)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 32 }}>
          ← Voltar ao dashboard
        </a>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.03em", marginBottom: 28 }}>
          Minha conta
        </p>

        {/* User */}
        <div style={card}>
          <p style={sLabel}>Dados da conta</p>
          {[["Nome", user.name ?? "—"], ["E-mail", user.email ?? "—"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{k}</span>
              <span style={{ fontSize: 13, color: "var(--ink-4)" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Usage meter */}
        {active && usage && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={sLabel}>Uso em {usage.monthLabel}</p>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{usage.used.toLocaleString("pt-BR")} / {usage.limit.toLocaleString("pt-BR")} analises</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: "var(--recess)", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${Math.min(100, usedPct)}%`, background: meterColor, borderRadius: 99, transition: "width 600ms" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{usedPct}% utilizado</span>
              <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{Math.max(0, usage.limit - usage.used).toLocaleString("pt-BR")} restantes</span>
            </div>
            {usedPct >= 80 && (
              <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 6 }}>
                <p style={{ fontSize: 12, color: "var(--yellow)" }}>
                  {usedPct >= 100
                    ? "Limite atingido. Faca upgrade para continuar analisando."
                    : `Voce esta em ${usedPct}% do limite. Considere fazer upgrade.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Plan */}
        <div style={card}>
          <p style={sLabel}>Plano atual</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-1)", marginBottom: 4 }}>
                {PLAN_LABELS[planId] ?? "AXIOM Core"}
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-3)" }}>{PLAN_PRICES[planId] ?? "R$ 197/mes"}</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: badge.color, background: badge.bg, padding: "4px 10px", borderRadius: 10, letterSpacing: "0.04em" }}>
              {badge.label.toUpperCase()}
            </span>
          </div>

          {active ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={handlePortal} disabled={!!loading} style={btnSecondary}>
                {loading === "portal" ? "Aguarde..." : "Gerenciar assinatura"}
              </button>
              {planId !== "operations" && planId !== "enterprise" && (
                <button onClick={() => handleUpgrade(planId === "core" ? "intelligence" : "operations")} disabled={!!loading} style={btnPrimary}>
                  {loading === "intelligence" || loading === "operations" ? "Aguarde..." :
                   `Fazer upgrade para ${planId === "core" ? "Intelligence" : "Operations"}`}
                </button>
              )}
            </div>
          ) : (
            <a href="/pricing" style={{ ...btnPrimary, display: "block", textAlign: "center", textDecoration: "none" } as React.CSSProperties}>
              Ver planos
            </a>
          )}
        </div>

        {/* Upgrade options when not active */}
        {!active && (
          <div style={card}>
            <p style={sLabel}>Comece agora</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {["core", "intelligence", "operations"].map(pid => (
                <button key={pid} onClick={() => handleUpgrade(pid)} disabled={!!loading} style={{
                  ...btnSecondary,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px",
                }}>
                  <span>{PLAN_LABELS[pid]}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{PLAN_PRICES[pid]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Change password */}
        <div style={card}>
          <p style={sLabel}>Alterar senha</p>
          <ChangePassword />
        </div>

        {/* Delete account */}
        <div style={card}>
          <p style={sLabel}>Excluir conta</p>
          <DeleteAccount />
        </div>

        {/* Sign out */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 13, color: "var(--ink-4)" }}>Encerrar sessao</p>
            <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
              background: "none", border: "1px solid rgba(220,38,38,0.3)",
              color: "var(--red)", fontSize: 12, padding: "6px 16px", borderRadius: 6,
              cursor: "pointer", fontFamily: "'Inter', sans-serif",
            }}>
              Sair
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: "var(--side-surface)", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10, padding: "24px 28px", marginBottom: 16,
}
const sLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "var(--ink-3)",
  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14,
}
const btnPrimary: React.CSSProperties = {
  width: "100%", padding: "12px 0", border: "none", borderRadius: 6,
  background: "var(--v)", color: "#fff", fontSize: 13, fontWeight: 600,
  fontFamily: "'Inter', sans-serif", cursor: "pointer",
}
const btnSecondary: React.CSSProperties = {
  width: "100%", padding: "11px 0", border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent", color: "var(--ink-4)", fontSize: 13, fontWeight: 500,
  fontFamily: "'Inter', sans-serif", cursor: "pointer", borderRadius: 6,
}
