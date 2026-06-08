"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

// ------ Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------
const STEPS = [
  {
    id:       "operacao",
    title:    "Qual é sua operação?",
    subtitle: "Selecione o perfil que melhor descreve como você atua.",
    options: [
      { id: "consultor",   label: "Consultor individual",    desc: "Atuo de forma independente" },
      { id: "assessoria",  label: "Assessoria tributária",   desc: "Escritório ou consultoria" },
      { id: "juridico",    label: "Escritório jurídico",     desc: "Advocacia tributária" },
      { id: "outbound",    label: "Operação outbound",       desc: "Time de prospecção ativo" },
      { id: "empresarial", label: "Consultoria empresarial", desc: "Gestao e tributos" },
    ],
    multi: false,
  },
  {
    id:       "volume",
    title:    "Empresas abordadas por mês",
    subtitle: "Quantas empresas você analisa ou aborda em média por mês?",
    options: [
      { id: "ate300",   label: "Ate 300",   desc: "Empresas analisadas/mes",        rec: "core" },
      { id: "300-1200", label: "300 – 1.200", desc: "Empresas analisadas/mes",        rec: "intelligence" },
      { id: "1200mais", label: "1.200+",    desc: "Empresas analisadas/mes",               rec: "operations" },
    ],
    multi: false,
  },
  {
    id:       "foco",
    title:    "Qual é seu foco principal?",
    subtitle: "Você pode selecionar mais de uma opção.",
    options: [
      { id: "inteligencia", label: "Inteligência comercial",  desc: "" },
      { id: "discovery",    label: "Discovery tributário",    desc: "" },
      { id: "juridico",     label: "Pesquisa jurídica",       desc: "" },
      { id: "reunioes",     label: "Preparação de reuniões",  desc: "" },
      { id: "prospeccao",   label: "Prospecção outbound",     desc: "" },
    ],
    multi: true,
  },
  {
    id:       "usuarios",
    title:    "Quantos usuarios no AXIOM?",
    subtitle: "Número de pessoas que vão usar a plataforma.",
    options: [
      { id: "1",   label: "1 usuario",  desc: "Uso individual" },
      { id: "2-5", label: "2 a 5",      desc: "Pequena equipe" },
      { id: "5+",  label: "5 ou mais",  desc: "Equipe estruturada" },
    ],
    multi: false,
  },
]

// ------ Component ---------------------------------------------------------------------------------------------------------------------------------------------------
export default function OnboardingPage() {
  const router = useRouter()

  const [step,     setStep]     = useState(0)
  const [answers,  setAnswers]  = useState<Record<string, string | string[]>>({})
  const [loading,  setLoading]  = useState(false)
  const [entering, setEntering] = useState(true)

  // Guard: need registration data
  useEffect(() => {
    const reg = sessionStorage.getItem("axiom_reg")
    if (!reg) router.push("/cadastro")
    setTimeout(() => setEntering(false), 50)
  }, [router])

  const current = STEPS[step]
  const answer  = answers[current?.id ?? ""] ?? (current?.multi ? [] : "")
  const isMulti = current?.multi ?? false

  function hasAnswer(): boolean {
    if (!current) return false
    const a = answers[current.id]
    if (isMulti) return Array.isArray(a) && a.length > 0
    return typeof a === "string" && a.length > 0
  }

  function select(optId: string) {
    const key = current.id
    if (isMulti) {
      const cur = (answers[key] as string[]) ?? []
      const next = cur.includes(optId)
        ? cur.filter(x => x !== optId)
        : [...cur, optId]
      setAnswers(a => ({ ...a, [key]: next }))
    } else {
      setAnswers(a => ({ ...a, [key]: optId }))
      // Auto-advance after short delay for non-multi
      setTimeout(() => handleNext(optId), 280)
    }
  }

  function isSelected(optId: string): boolean {
    const a = answers[current?.id ?? ""]
    if (isMulti) return Array.isArray(a) && a.includes(optId)
    return a === optId
  }

  const handleNext = useCallback(async (autoAnswer?: string) => {
    const finalAnswers = autoAnswer
      ? { ...answers, [current.id]: autoAnswer }
      : answers

    if (!finalAnswers[current.id] ||
        (Array.isArray(finalAnswers[current.id]) && (finalAnswers[current.id] as string[]).length === 0)) {
      return
    }

    if (step < STEPS.length - 1) {
      setEntering(true)
      setTimeout(() => {
        setStep(s => s + 1)
        setEntering(false)
      }, 150)
    } else {
      // Final step - save and navigate
      setLoading(true)
      try {
        const reg  = JSON.parse(sessionStorage.getItem("axiom_reg") ?? "{}")
        const vol  = (finalAnswers.volume as string) ?? ""
        const rec  = STEPS[1].options.find(o => o.id === vol)?.rec ?? "intelligence"

        sessionStorage.setItem("axiom_reg", JSON.stringify({
          ...reg,
          operacao:        finalAnswers.operacao,
          volume:          finalAnswers.volume,
          foco:            Array.isArray(finalAnswers.foco) ? finalAnswers.foco.join(",") : finalAnswers.foco,
          usuarios:        finalAnswers.usuarios,
          recommendedPlan: rec,
        }))

        await new Promise(r => setTimeout(r, 500))
        router.push("/planos")
      } catch {
        setLoading(false)
      }
    }
  }, [answers, current, step, router])

  function handleBack() {
    if (step > 0) {
      setEntering(true)
      setTimeout(() => {
        setStep(s => s - 1)
        setEntering(false)
      }, 100)
    }
  }

  if (!current) return null

  const pct = Math.round(((step) / STEPS.length) * 100)

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAFBFC", backgroundImage: `linear-gradient(rgba(79,70,229,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,70,229,0.03) 1px,transparent 1px)`, backgroundSize: "48px 48px",
      fontFamily: "'Inter',-apple-system,sans-serif",
      display: "flex", flexDirection: "column",
    }}>

      {/* Top bar */}
      <div style={{
        height: 56,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: "#0C1222", letterSpacing: "-0.02em" }}>AXIOM</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#334155" }}>{step + 1} de {STEPS.length}</span>
          <div style={{ width: 120, height: 4, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((step + 1) / STEPS.length) * 100}%`, background: "#4F46E5", borderRadius: 99, transition: "width 400ms cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 24px 0", gap: 6 }}>
        {STEPS.map((s, i) => {
          const done = i < step
          const active = i === step
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? "#059669" : active ? "#4F46E5" : "#E2E8F0",
                border: active ? "2px solid #6D28D9" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 300ms",
              }}>
                {done
                  ? <span style={{ color: "#fff", fontSize: 13 }}>✓</span>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : "#334155" }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: 11, color: done ? "#10B981" : active ? "#0C1222" : "#334155", fontWeight: active ? 600 : 400, transition: "all 300ms" }}>
                {s.id === "operacao" ? "Operação" : s.id === "volume" ? "Volume" : s.id === "foco" ? "Objetivos" : "Equipe"}
              </span>
              {i < STEPS.length - 1 && (
                <div style={{ width: 24, height: 1, background: done ? "#059669" : "#E2E8F0", transition: "all 300ms" }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px 80px" }}>
        <div style={{
          width: "100%", maxWidth: 560,
          opacity: entering ? 0 : 1,
          transform: entering ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}>

          {/* Question header */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              Configuracao {step + 1} de {STEPS.length}
            </p>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color: "#0C1222", letterSpacing: "-0.03em", marginBottom: 8 }}>
              {current.title}
            </h2>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
              {current.subtitle}
              {isMulti && answers[current.id] && (answers[current.id] as string[]).length > 0 && (
                <span style={{ color: "#4F46E5", fontWeight: 600, marginLeft: 6 }}>
                  — {(answers[current.id] as string[]).length} selecionado{(answers[current.id] as string[]).length > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>

          {/* Options */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 8,
            ...(current.id === "foco" ? { flexDirection: "row", flexWrap: "wrap" } as any : {}),
          }}>
            {current.options.map(opt => {
              const sel = isSelected(opt.id)

              if (current.id === "foco") {
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => select(opt.id)}
                    style={{
                      padding: "10px 18px",
                      border: `1px solid ${sel ? "#4F46E5" : "#E2E8F0"}`,
                      borderRadius: 24,
                      background: sel ? "rgba(79,70,229,0.15)" : "rgba(255,255,255,0.02)",
                      color: sel ? "#A5B4FC" : "#64748B",
                      fontSize: 13, fontFamily: "'Inter',sans-serif",
                      fontWeight: sel ? 600 : 400,
                      cursor: "pointer", transition: "all 150ms",
                      outline: "none",
                    }}
                  >
                    {sel && <span style={{ marginRight: 6 }}>✓</span>}
                    {opt.label}
                  </button>
                )
              }

              if (current.id === "volume") {
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => select(opt.id)}
                    style={{
                      padding: "18px 20px",
                      border: `1px solid ${sel ? "#4F46E5" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 10,
                      background: sel ? "rgba(79,70,229,0.1)" : "rgba(255,255,255,0.02)",
                      cursor: "pointer", transition: "all 150ms",
                      textAlign: "left" as const,
                      outline: "none",
                      boxShadow: sel ? "0 0 0 2px #4F46E5" : "none",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: sel ? "#0C1222" : "#94A3B8", marginBottom: 4 }}>{opt.label}</p>
                      <p style={{ fontSize: 12, color: sel ? "#818CF8" : "#334155" }}>{opt.desc}</p>
                    </div>
                    {sel && (
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fff", fontSize: 13 }}>✓</span>
                      </div>
                    )}
                  </button>
                )
              }

              if (current.id === "usuarios") {
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => select(opt.id)}
                    style={{
                      padding: "18px 20px",
                      border: `1px solid ${sel ? "#4F46E5" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 10,
                      background: sel ? "rgba(79,70,229,0.1)" : "rgba(255,255,255,0.02)",
                      cursor: "pointer", transition: "all 150ms",
                      textAlign: "left" as const,
                      outline: "none",
                      boxShadow: sel ? "0 0 0 2px #4F46E5" : "none",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: sel ? "#0C1222" : "#94A3B8", marginBottom: 4 }}>{opt.label}</p>
                      <p style={{ fontSize: 12, color: sel ? "#818CF8" : "#334155" }}>{opt.desc}</p>
                    </div>
                    {sel && (
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fff", fontSize: 13 }}>✓</span>
                      </div>
                    )}
                  </button>
                )
              }

              // Default: radio rows (operacao)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => select(opt.id)}
                  style={{
                    padding: "14px 18px",
                    border: `1px solid ${sel ? "#4F46E5" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 10,
                    background: sel ? "rgba(79,70,229,0.08)" : "rgba(255,255,255,0.02)",
                    cursor: "pointer", transition: "all 150ms",
                    textAlign: "left" as const, outline: "none",
                    boxShadow: sel ? "0 0 0 2px rgba(79,70,229,0.4)" : "none",
                    display: "flex", alignItems: "center", gap: 14,
                    width: "100%",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: `2px solid ${sel ? "#4F46E5" : "#334155"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 150ms",
                    background: sel ? "#4F46E5" : "transparent",
                  }}>
                    {sel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? "#0C1222" : "#94A3B8", marginBottom: 2, fontFamily: "'Inter',sans-serif" }}>
                      {opt.label}
                    </p>
                    {opt.desc && (
                      <p style={{ fontSize: 12, color: sel ? "#818CF8" : "#334155", fontFamily: "'Inter',sans-serif" }}>
                        {opt.desc}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div style={{ marginTop: 36, display: "flex", gap: 10 }}>
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                style={{
                  padding: "12px 20px", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, background: "transparent",
                  color: "#475569", fontSize: 14, fontFamily: "'Inter',sans-serif",
                  cursor: "pointer", transition: "all 150ms", outline: "none",
                }}
              >
                ← Voltar
              </button>
            )}

            {isMulti && (
              <button
                type="button"
                onClick={() => handleNext()}
                disabled={!hasAnswer() || loading}
                style={{
                  flex: 1, padding: "13px 0", border: "none", borderRadius: 8,
                  background: !hasAnswer() ? "rgba(79,70,229,0.2)" : "#4F46E5",
                  color: !hasAnswer() ? "#334155" : "#fff",
                  fontSize: 14, fontWeight: 600,
                  fontFamily: "'Space Grotesk',sans-serif",
                  cursor: !hasAnswer() ? "not-allowed" : "pointer",
                  transition: "all 200ms", outline: "none",
                  boxShadow: !hasAnswer() ? "none" : "0 1px 2px rgba(0,0,0,0.4)",
                  letterSpacing: "-0.01em",
                }}
              >
                {loading
                  ? "Preparando ambiente AXIOM..."
                  : step === STEPS.length - 1
                    ? "Configurar workspace →"
                    : "Continuar →"
                }
              </button>
            )}

            {!isMulti && !hasAnswer() && (
              <div style={{ flex: 1, padding: "13px 20px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 13, color: "#334155" }}>Selecione uma opção para continuar</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
