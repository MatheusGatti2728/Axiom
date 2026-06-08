"use client"
import React, { useState, useEffect } from "react"

interface Analytics {
  snapshot: {
    total_users: number
    paying_users: number
    internal_users: number
    inactive_users: number
    canceled_users: number
    mrr_cents: number
    mrr_display: string
    analyses_this_month: number
    new_users_7d: number
  }
  by_plan: Record<string, number>
  top_users: Array<{ name: string; email: string; plan: string; usage: number }>
  generated_at: string
}

export default function AnalyticsPage() {
  const [secret,  setSecret]  = useState("")
  const [data,    setData]    = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [authed,  setAuthed]  = useState(false)

  async function load() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/analytics", {
        headers: { "x-admin-secret": secret },
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? "Erro."); return }
      setData(json); setAuthed(true)
    } catch { setError("Erro de conexão.") }
    finally { setLoading(false) }
  }

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "20px 22px" }
  const metric = (label: string, value: string | number, sub?: string, color = "#F1F5F9") => (
    <div style={card}>
      <p style={{ fontSize: 11, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color, letterSpacing: "-0.04em", marginBottom: sub ? 4 : 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "#334155" }}>{sub}</p>}
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#05080F", fontFamily: "'Inter',sans-serif", color: "#F1F5F9", padding: "40px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#4338CA,#6D28D9)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>AXIOM</p>
            <p style={{ fontSize: 10, color: "#334155", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>Analytics Dashboard</p>
          </div>
        </div>

        {!authed ? (
          <div style={{ maxWidth: 360 }}>
            <div style={{ ...card, padding: "28px 24px" }}>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Informe a senha de administrador para acessar os analytics.</p>
              <input
                type="password" value={secret}
                onChange={e => setSecret(e.target.value)}
                onKeyDown={e => e.key === "Enter" && load()}
                placeholder="ADMIN_SECRET"
                style={{ width: "100%", boxSizing: "border-box" as const, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#F1F5F9", fontFamily: "'Inter',sans-serif", fontSize: 14, padding: "10px 12px", borderRadius: 7, outline: "none", marginBottom: 12 }}
              />
              {error && <p style={{ fontSize: 12, color: "#F87171", marginBottom: 10 }}>{error}</p>}
              <button onClick={load} disabled={loading || !secret} style={{ width: "100%", padding: "10px 0", border: "none", borderRadius: 7, background: "#4F46E5", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
                {loading ? "Carregando..." : "Acessar analytics"}
              </button>
            </div>
          </div>
        ) : data ? (
          <>
            <p style={{ fontSize: 11, color: "#334155", marginBottom: 28 }}>
              Atualizado em {new Date(data.generated_at).toLocaleString("pt-BR")}
              <button onClick={load} style={{ marginLeft: 12, fontSize: 11, color: "#4F46E5", background: "none", border: "none", cursor: "pointer" }}>↻ Atualizar</button>
            </p>

            {/* MRR highlight */}
            <div style={{ ...card, borderColor: "rgba(79,70,229,0.2)", background: "rgba(79,70,229,0.04)", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 11, color: "#4F46E5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>MRR ESTIMADO</p>
                <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.04em" }}>{data.snapshot.mrr_display}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, color: "#334155", marginBottom: 4 }}>{data.snapshot.paying_users} usuários pagantes</p>
                <p style={{ fontSize: 12, color: "#334155" }}>{data.snapshot.new_users_7d} novos nos últimos 7 dias</p>
              </div>
            </div>

            {/* Metrics grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 28 }}>
              {metric("Total de usuários",   data.snapshot.total_users)}
              {metric("Usuários pagantes",   data.snapshot.paying_users, "assinaturas ativas", "#818CF8")}
              {metric("Equipe interna",      data.snapshot.internal_users, "sem cobrança")}
              {metric("Inativos",            data.snapshot.inactive_users, "sem assinatura")}
              {metric("Cancelados",          data.snapshot.canceled_users, "histórico")}
              {metric("Análises este mês",   data.snapshot.analyses_this_month, "total da base", "#22C55E")}
            </div>

            {/* By plan */}
            <div style={{ ...card, marginBottom: 24 }}>
              <p style={{ fontSize: 11, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>DISTRIBUIÇÃO POR PLANO</p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {Object.entries(data.by_plan).map(([plan, count]) => (
                  <div key={plan} style={{ padding: "8px 16px", background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.12)", borderRadius: 20 }}>
                    <span style={{ fontSize: 12, color: "#818CF8", textTransform: "capitalize", fontWeight: 600 }}>{plan}</span>
                    <span style={{ fontSize: 12, color: "#334155", marginLeft: 8 }}>{count} usuário{count !== 1 ? "s" : ""}</span>
                  </div>
                ))}
                {Object.keys(data.by_plan).length === 0 && <p style={{ fontSize: 13, color: "#334155" }}>Nenhum usuário pagante ainda.</p>}
              </div>
            </div>

            {/* Top users */}
            {data.top_users.length > 0 && (
              <div style={card}>
                <p style={{ fontSize: 11, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>TOP USUÁRIOS — ESTE MÊS</p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Nome", "E-mail", "Plano", "Análises"].map(h => (
                        <th key={h} style={{ textAlign: "left", fontSize: 10, color: "#334155", letterSpacing: "0.06em", paddingBottom: 10, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_users.map((u, i) => (
                      <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ fontSize: 13, color: "#F1F5F9", padding: "10px 0" }}>{u.name}</td>
                        <td style={{ fontSize: 12, color: "#475569", padding: "10px 8px" }}>{u.email}</td>
                        <td style={{ fontSize: 11, color: "#818CF8", textTransform: "capitalize", padding: "10px 8px" }}>{u.plan}</td>
                        <td style={{ fontSize: 13, color: "#22C55E", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, padding: "10px 0" }}>{u.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
