"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"

const STEPS = [
  {
    index:   "01",
    title:   "Dossiê por CNPJ",
    caption: "O núcleo da plataforma",
    body:    "Digite o CNPJ de qualquer empresa no campo de busca. O sistema consulta Receita Federal, mapeia decisores, cruza histórico jurídico e calcula oportunidades tributárias — tudo em menos de 60 segundos.",
    detail:  "Use CNPJs de empresas que já estão no seu pipeline. O dossiê será específico para a operação delas, não genérico.",
  },
  {
    index:   "02",
    title:   "Oportunidades tributárias",
    caption: "Potencial financeiro calculado",
    body:    "A aba Oportunidades mapeia teses tributárias aplicáveis com base no CNAE, regime fiscal e faturamento estimado. O sistema calcula o potencial retroativo dos últimos 5 anos e apresenta as teses por ordem de relevância.",
    detail:  "O score de oportunidade prioriza automaticamente as teses com maior potencial e menor risco processual.",
  },
  {
    index:   "03",
    title:   "Decisores mapeados",
    caption: "Com quem falar e como abordar",
    body:    "A aba Decisores identifica CFOs, diretores financeiros, contadores e advogados tributários — com cargo, contexto e perfil psicológico de abordagem. O sistema calcula qual perfil tem maior chance de abertura para aquela empresa.",
    detail:  "O Playbook já vem personalizado com o nome do decisor identificado e o gancho recomendado para a ligação.",
  },
  {
    index:   "04",
    title:   "Histórico jurídico",
    caption: "Postura fiscal antes da reunião",
    body:    "A aba Jur. Tributário consolida processos administrativos, mandados de segurança, execuções fiscais e histórico de litígios. Você chega à reunião sabendo exatamente qual é a maturidade jurídica da empresa.",
    detail:  "Empresas com histórico de litígios tributários são clientes com maior propensão a contratar — elas já conhecem o problema.",
  },
  {
    index:   "05",
    title:   "Playbook operacional",
    caption: "Como executar a abordagem",
    body:    "A aba Operações reúne o roteiro completo: antes de ligar, condução da ligação, WhatsApp por perfil, respostas a objeções e protocolo pós-ligação. Tudo personalizado com os dados da empresa analisada.",
    detail:  "O sistema calcula o score de abertura por persona — Fiscal, Contador, Advogado ou CFO — e recomenda qual abordar primeiro.",
  },
]

export default function TourPage() {
  const router  = useRouter()
  const { data: session, update } = useSession()
  const [step,    setStep]    = useState(0)
  const [leaving, setLeaving] = useState(false)
  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1
  const name    = (session?.user as any)?.name?.split(" ")[0] ?? "Consultor"
  const pct     = Math.round(((step + 1) / STEPS.length) * 100)

  async function finish() {
    if (leaving) return
    setLeaving(true)
    try {
      await fetch("/api/tour/complete", { method: "POST" })
      // Force session refresh so middleware sees tourCompleted = true
      await update({ tourCompleted: true })
    } catch { }
    router.push("/dashboard")
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFFFFF",
      display: "flex",
      fontFamily: "'Inter',-apple-system,sans-serif",
      color: "#0C1222",
    }}>

      {/* ── LEFT: Progress rail ───────────────────────────── */}
      <div style={{
        width: 280, flexShrink: 0,
        background: "#0B0F19",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px 40px",
      }}>
        {/* Logo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
            <div style={{ width: 20, height: 20, background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, color: "#F1F5F9", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>AXIOM</span>
          </div>

          {/* Steps nav */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {STEPS.map((s, i) => {
              const done   = i < step
              const active = i === step
              return (
                <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < STEPS.length - 1 ? 28 : 0, position: "relative" }}>
                  {i < STEPS.length - 1 && (
                    <div style={{ position: "absolute", left: 11, top: 24, width: 1, height: "calc(100% - 8px)", background: done ? "rgba(79,70,229,0.4)" : "rgba(255,255,255,0.06)" }} />
                  )}
                  <div style={{
                    width: 22, height: 22, flexShrink: 0,
                    border: `1px solid ${active ? "#4F46E5" : done ? "rgba(79,70,229,0.4)" : "rgba(255,255,255,0.08)"}`,
                    background: active ? "#4F46E5" : done ? "rgba(79,70,229,0.15)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 300ms",
                  }}>
                    {done
                      ? <span style={{ color: "#818CF8", fontSize: 10, fontWeight: 700 }}>✓</span>
                      : <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: active ? "#fff" : "#1E293B" }}>{s.index}</span>
                    }
                  </div>
                  <div style={{ paddingTop: 2 }}>
                    <p style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#F1F5F9" : done ? "#475569" : "#1E293B", lineHeight: 1.3, transition: "color 200ms" }}>
                      {s.title}
                    </p>
                    {active && (
                      <p style={{ fontSize: 10, color: "#334155", marginTop: 3, letterSpacing: "0.02em" }}>{s.caption}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress + skip */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#1E293B", letterSpacing: "0.1em" }}>PROGRESSO</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#334155" }}>{pct}%</span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "#4F46E5", transition: "width 400ms" }} />
            </div>
          </div>
          <button onClick={finish} disabled={leaving} style={{ fontSize: 11, color: "#1E293B", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", padding: 0, textAlign: "left" as const }}>
            {leaving ? "Redirecionando..." : "Pular introdução →"}
          </button>
        </div>
      </div>

      {/* ── RIGHT: Content ────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex", flexDirection: "column" as const, justifyContent: "center",
        padding: "64px 80px",
        maxWidth: 680,
      }}>

        {/* Welcome line — only on first step */}
        {step === 0 && (
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#94A3B8", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 40 }}>
            Bem-vindo, {name} — Introdução ao AXIOM
          </p>
        )}

        {/* Step index */}
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#4F46E5", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 16 }}>
          {current.index} / {STEPS.length.toString().padStart(2, "0")} — {current.caption}
        </p>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 36, fontWeight: 700,
          color: "#0C1222", letterSpacing: "-0.045em",
          lineHeight: 1.05, marginBottom: 24,
        }}>
          {current.title}
        </h1>

        {/* Divider */}
        <div style={{ width: 24, height: 1, background: "rgba(79,70,229,0.4)", marginBottom: 24 }} />

        {/* Body */}
        <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.85, marginBottom: 28, maxWidth: 520 }}>
          {current.body}
        </p>

        {/* Detail note */}
        <div style={{ paddingLeft: 16, borderLeft: "2px solid #E2E8F0", marginBottom: 56 }}>
          <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7 }}>
            {current.detail}
          </p>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              padding: "10px 20px", background: "transparent",
              border: "1px solid #E2E8F0", color: "#6B7280",
              fontSize: 13, cursor: "pointer",
              fontFamily: "'Inter',sans-serif", transition: "all 150ms",
            }}>
              ← Anterior
            </button>
          )}
          {isLast ? (
            <button onClick={finish} disabled={leaving} style={{
              padding: "11px 32px",
              background: leaving ? "#E2E8F0" : "#4F46E5",
              color: leaving ? "#94A3B8" : "#FFFFFF",
              border: "none", fontSize: 13, fontWeight: 600,
              fontFamily: "'Space Grotesk',sans-serif",
              cursor: leaving ? "not-allowed" : "pointer",
              transition: "all 150ms", letterSpacing: "-0.01em",
            }}>
              {leaving ? "Entrando no AXIOM..." : "Acessar plataforma →"}
            </button>
          ) : (
            <button onClick={() => setStep(s => s + 1)} style={{
              padding: "11px 32px",
              background: "#4F46E5", color: "#FFFFFF",
              border: "none", fontSize: 13, fontWeight: 600,
              fontFamily: "'Space Grotesk',sans-serif",
              cursor: "pointer", transition: "all 150ms",
              letterSpacing: "-0.01em",
            }}>
              Próximo →
            </button>
          )}

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 5, marginLeft: 8 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 16 : 5, height: 5,
                  background: i === step ? "#4F46E5" : i < step ? "#C7D2FE" : "#E2E8F0",
                  borderRadius: 99, cursor: "pointer",
                  transition: "all 300ms",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
