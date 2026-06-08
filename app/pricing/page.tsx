"use client"

import React, { useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

const PLANS = [
  {
    id:          "core",
    name:        "AXIOM Core",
    price:       "R$ 197",
    limit:       "500 analises/mes",
    overage:     "+ R$ 39 por 100 extras",
    description: "Para consultores individuais e operacoes iniciais.",
    recommended: false,
    badge:       null as string | null,
    featuresIn: [
      "500 analises estrategicas por mes",
      "Contexto empresarial completo",
      "Motor de oportunidades tributarias",
      "Mapeamento de decisores por CNPJ",
      "Playbook por perfil de decisor",
      "Compositor de e-mail com IA",
      "Score de priorizacao de carteira",
    ],
    featuresOut: [
      "Historico juridico profundo",
      "Calculadoras de teses tributarias",
      "Exportacao PDF",
      "Multiusuario",
    ],
  },
  {
    id:          "intelligence",
    name:        "AXIOM Intelligence",
    price:       "R$ 497",
    limit:       "1.200 analises/mes",
    overage:     "+ R$ 39 por 100 extras",
    description: "Para consultores profissionais e assessorias tributarias.",
    recommended: true,
    badge:       "Mais popular",
    featuresIn: [
      "1.200 analises estrategicas por mes",
      "Tudo do Core incluido",
      "Historico juridico em 5 camadas",
      "Pesquisa TRF, JusBrasil, Escavador, PGFN",
      "Calculadoras de teses tributarias",
      "Playbook avancado por persona",
      "Timeline juridica com score de confianca",
      "Exportacao PDF dos dossies",
    ],
    featuresOut: [
      "Multiusuario",
      "Analytics de equipe",
    ],
  },
  {
    id:          "operations",
    name:        "AXIOM Operations",
    price:       "R$ 1.490",
    limit:       "5.000 analises/mes",
    overage:     "+ R$ 25 por 100 extras",
    description: "Para escritorios estruturados e equipes comerciais.",
    recommended: false,
    badge:       null,
    featuresIn: [
      "5.000 analises estrategicas por mes",
      "Tudo do Intelligence incluido",
      "Multiusuario — ate 10 seats",
      "Analytics e relatorios de equipe",
      "Historico de dossies e CRM basico",
      "Monitoramento continuo de empresas",
      "Exportacoes enterprise ilimitadas",
      "Suporte prioritario",
    ],
    featuresOut: [],
  },
]

function PricingContent() {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const params   = useSearchParams()
  const canceled = params.get("cancelado") === "true"
  const [loading, setLoading] = useState<string | null>(null)
  const [error,   setError]   = useState("")

  async function handleSubscribe(planId: string) {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/pricing")
      return
    }
    setLoading(planId)
    setError("")
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? "Erro ao iniciar pagamento.")
        setLoading(null)
      }
    } catch {
      setError("Erro de conexao. Tente novamente.")
      setLoading(null)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      fontFamily: "Inter, sans-serif",
      color: "#F1F5F9",
      padding: "56px 20px 80px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 600, margin: "0 auto 52px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
          AXIOM Intelligence Platform
        </p>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 36, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 14 }}>
          Escolha o plano certo para a sua operacao
        </h1>
        <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.7 }}>
          7 dias gratis em qualquer plano. Cancele quando quiser.
        </p>
      </div>

      {/* Alerts */}
      {canceled && (
        <div style={{ maxWidth: 920, margin: "0 auto 28px", padding: "12px 20px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 8, fontSize: 13, color: "#F87171", textAlign: "center" }}>
          Pagamento cancelado. Sua conta continua disponivel.
        </div>
      )}
      {error && (
        <div style={{ maxWidth: 920, margin: "0 auto 20px", padding: "12px 20px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 8, fontSize: 13, color: "#F87171", textAlign: "center" }}>
          {error}
        </div>
      )}

      {/* Cards - responsive flex instead of grid */}
      <div style={{
        maxWidth: 1020, margin: "0 auto",
        display: "flex", flexWrap: "wrap", gap: 20,
        justifyContent: "center",
      }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            width: 300, minWidth: 280, flexShrink: 0,
            background: plan.recommended ? "#131929" : "#0F1629",
            border: `1px solid ${plan.recommended ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 16,
            boxShadow: plan.recommended ? "0 0 40px rgba(79,70,229,0.12)" : "none",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Badge */}
            {plan.badge && (
              <div style={{ background: "#4F46E5", padding: "7px 0", textAlign: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>
                  {plan.badge.toUpperCase()}
                </span>
              </div>
            )}

            <div style={{ padding: "28px 28px 0", flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Name */}
              <p style={{ fontSize: 11, fontWeight: 700, color: plan.recommended ? "#818CF8" : "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                {plan.name}
              </p>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 42, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.04em" }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: 14, color: "#475569" }}>/mes</span>
              </div>
              <p style={{ fontSize: 12, color: "#334155", marginBottom: 2 }}>{plan.limit}</p>
              <p style={{ fontSize: 11, color: "#334155", marginBottom: 16 }}>{plan.overage}</p>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {plan.description}
              </p>

              {/* Features in */}
              <div style={{ flex: 1 }}>
                {plan.featuresIn.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ color: "#059669", fontSize: 13, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <p style={{ fontSize: 12.5, color: "#94A3B8", lineHeight: 1.5, margin: 0 }}>{f}</p>
                  </div>
                ))}
                {plan.featuresOut.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ color: "#334155", fontSize: 12, flexShrink: 0, marginTop: 2 }}>–</span>
                    <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.5, margin: 0 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ padding: "20px 28px 28px" }}>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={!!loading}
                style={{
                  width: "100%", padding: "13px 0",
                  border: plan.recommended ? "none" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  background: plan.recommended
                    ? (loading === plan.id ? "#3730A3" : "#4F46E5")
                    : "rgba(255,255,255,0.05)",
                  color: plan.recommended ? "#fff" : "#94A3B8",
                  fontSize: 14, fontWeight: 600,
                  fontFamily: "Space Grotesk, sans-serif",
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "-0.01em",
                } as React.CSSProperties}
              >
                {loading === plan.id ? "Redirecionando..." :
                 status === "unauthenticated" ? "Criar conta gratis" :
                 "Comecar 7 dias gratis"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enterprise */}
      <div style={{ maxWidth: 920, margin: "24px auto 0", padding: "20px 28px", background: "#0F1629", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 600, color: "#F1F5F9", marginBottom: 4 }}>
            AXIOM Enterprise
          </p>
          <p style={{ fontSize: 13, color: "#475569" }}>
            Volume ilimitado, white label, API e implantacao. A partir de R$ 5.000/mes.
          </p>
        </div>
        <a href="mailto:contato@axiom.com.br" style={{ flexShrink: 0, padding: "10px 24px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#94A3B8", fontSize: 13, textDecoration: "none", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" } as React.CSSProperties}>
          Falar com o time
        </a>
      </div>

      {/* Value prop */}
      <div style={{ maxWidth: 600, margin: "48px auto 0", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.9 }}>
          Uma analise manual completa leva entre 15 e 40 minutos por empresa.
          O AXIOM reduz isso para menos de 60 segundos.
        </p>
      </div>

      {/* Bottom links */}
      <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 40 }}>
        {session
          ? <a href="/conta" style={{ fontSize: 13, color: "#334155", textDecoration: "none" }}>Minha conta</a>
          : <a href="/login" style={{ fontSize: 13, color: "#334155", textDecoration: "none" }}>Ja tenho conta</a>}
        <a href="/dashboard" style={{ fontSize: 13, color: "#334155", textDecoration: "none" }}>Voltar ao dashboard</a>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0B0F19" }} />}>
      <PricingContent />
    </Suspense>
  )
}
