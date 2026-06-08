"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"

const PLANS = [
  {
    id:          "core",
    name:        "Core",
    priceFrom:   "197,90",
    price:       "119,90",
    hasPromo:    true,
    promoLabel:  "Lançamento",
    limit:       "500 análises estratégicas/mês",
    overage:     "+ R$ 39 / 100 extras",
    saving:      "~125h economizadas/mês",
    features: [
      "500 análises estratégicas/mês",
      "Contexto empresarial completo",
      "Motor de oportunidades tributárias",
      "Mapeamento de decisores por CNPJ",
      "Playbook por perfil de decisor",
      "Compositor de e-mail com IA",
    ],
    forVolumes: ["ate300"],
  },
  {
    id:          "intelligence",
    name:        "Intelligence",
    priceFrom:   null,
    price:       "497",
    hasPromo:    false,
    promoLabel:  null,
    limit:       "1.200 análises estratégicas/mês",
    overage:     "+ R$ 39 / 100 extras",
    saving:      "~300h economizadas/mês",
    highlighted: true,
    badge:       "Mais popular",
    features: [
      "1.200 análises estratégicas/mês",
      "Tudo do Core incluído",
      "Inteligência jurídica em 5 camadas",
      "Pesquisa TRF, JusBrasil, Escavador, PGFN",
      "Calculadoras de teses tributárias",
      "Timeline jurídica + Exportação PDF",
    ],
    forVolumes: ["300-1200"],
  },
  {
    id:          "operations",
    name:        "Operations",
    priceFrom:   null,
    price:       "1.490",
    hasPromo:    false,
    promoLabel:  null,
    limit:       "5.000 análises estratégicas/mês",
    overage:     "+ R$ 25 / 100 extras",
    saving:      "~1.250h economizadas/mês",
    features: [
      "5.000 análises estratégicas/mês",
      "Tudo do Intelligence incluido",
      "Multiusuário — até 10 seats",
      "Analytics e relatorios de equipe",
      "Monitoramento contínuo",
      "Suporte prioritário dedicado",
    ],
    forVolumes: ["1200mais"],
  },
]

function PlanosContent() {
  const router   = useRouter()
  const params   = useSearchParams()
  const canceled = params.get("cancelado") === "true"

  const { data: session } = useSession()
  const userStatus = (session?.user as any)?.subscriptionStatus
  const [recommended, setRecommended] = useState("intelligence")
  const [selected,    setSelected]    = useState("intelligence")
  const [loading,     setLoading]     = useState(false)
  const [loadingPlan, setLoadingPlan] = useState("")
  const [error,       setError]       = useState("")
  const [regData,     setRegData]     = useState<any>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("axiom_reg")
    if (!raw) { router.push("/cadastro"); return }
    try {
      const data = JSON.parse(raw)
      setRegData(data)
      const rec = data.recommendedPlan ?? "intelligence"
      setRecommended(rec)
      setSelected(rec)   // start with recommended but user can freely change
    } catch { router.push("/cadastro") }
  }, [router])

  async function handleCheckout(planId: string) {
    if (loading) return
    setSelected(planId)
    setError("")

    if (!regData) { router.push("/cadastro"); return }

    setLoading(true)
    setLoadingPlan(planId)

    try {
      const res = await fetch("/api/stripe/checkout-onboarding", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          name:     regData.name,
          email:    regData.email,
          password: regData.password,
          phone:    regData.phone    ?? "",
          cpf:      regData.cpf      ?? "",
          operacao: regData.operacao ?? "",
          volume:   regData.volume   ?? "",
          foco:     regData.foco     ?? "",
          usuarios: regData.usuarios ?? "",
        }),
      })

      const data = await res.json()

      if (data.url) {
        sessionStorage.removeItem("axiom_reg")
        window.location.href = data.url
      } else {
        setError(data.error ?? "Erro ao iniciar checkout. Tente novamente.")
        setLoading(false)
        setLoadingPlan("")
      }
    } catch {
      setError("Erro de conexao. Tente novamente.")
      setLoading(false)
      setLoadingPlan("")
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--canvas)", backgroundImage: `linear-gradient(rgba(79,70,229,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,70,229,0.03) 1px,transparent 1px)`, backgroundSize: "48px 48px",
      fontFamily: "'Inter',-apple-system,sans-serif",
    }}>
      {/* Top bar */}
      <div style={{ height: 56, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>AXIOM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {["Conta", "Perfil", "Plano"].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: i < 2 ? "var(--green)" : "var(--v)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i < 2 ? <span style={{ color: "#fff", fontSize: 11 }}>✓</span> : <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>3</span>}
                </div>
                <span style={{ fontSize: 11, color: i < 2 ? "var(--green)" : "var(--ink-1)", fontWeight: i === 2 ? 600 : 400 }}>{s}</span>
              </div>
              {i < 2 && <div style={{ width: 16, height: 1, background: "var(--recess)" }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 20px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--v)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Selecione seu plano
          </p>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.04em", marginBottom: 10 }}>
            Escolha a infraestrutura certa para a sua operação
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 6 }}>
            Uma análise manual leva até 40 minutos. O AXIOM reduz para menos de 60 segundos.
          </p>
          {recommended && (
            <p style={{ fontSize: 13, color: "var(--v-hi)" }}>
              Com base no seu perfil, recomendamos o plano destacado — mas voce pode escolher qualquer um.
            </p>
          )}
        </div>

        {canceled && (
          <div style={{ maxWidth: 600, margin: "0 auto 28px", padding: "14px 18px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderLeft: "3px solid #EF4444", borderRadius: 6 }}>
            <p style={{ fontSize: 13, color: "var(--red-wash)", marginBottom: 8 }}>Pagamento cancelado. Você pode tentar novamente ou fazer login se já tem uma conta.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="/login" style={{ fontSize: 12, color: "var(--v-hi)", textDecoration: "none", fontWeight: 500 }}>
                Fazer login →
              </a>
              <span style={{ fontSize: 12, color: "var(--ink-4)" }}>ou escolha um plano abaixo para tentar novamente</span>
            </div>
          </div>
        )}

        {/* Waiting for webhook activation */}
        {session && userStatus === "inactive" && params.get("pago") === "true" && (
          <div style={{ maxWidth: 600, margin: "0 auto 28px", padding: "14px 18px", background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.15)", borderLeft: "3px solid #4F46E5", borderRadius: 6 }}>
            <p style={{ fontSize: 13, color: "var(--v-hi)", marginBottom: 8, fontWeight: 500 }}>Pagamento confirmado! Ativando seu acesso...</p>
            <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Isso pode levar alguns segundos. Clique em verificar quando estiver pronto.</p>
            <button onClick={() => window.location.reload()} style={{ fontSize: 12, color: "var(--v-hi)", background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.2)", borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
              Verificar ativação
            </button>
          </div>
        )}

        {error && (
          <div style={{ maxWidth: 600, margin: "0 auto 28px", padding: "12px 18px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderLeft: "3px solid #EF4444", borderRadius: 6 }}>
            <p style={{ fontSize: 13, color: "var(--red-wash)", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Cards */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {PLANS.map(plan => {
            const isSel     = selected === plan.id
            const isRec     = recommended === plan.id
            const isLoading = loadingPlan === plan.id

            return (
              <div key={plan.id} style={{
                width: 310, minWidth: 270,
                background: plan.highlighted ? "linear-gradient(160deg, #0E1828 0%, #0A1220 100%)" : "var(--canvas)",
                border: `1px solid ${isSel ? "var(--v)" : isRec ? "rgba(79,70,229,0.25)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 10, overflow: "hidden",
                boxShadow: isSel ? "0 0 0 2px #4F46E5, 0 16px 48px rgba(79,70,229,0.15)" : isRec ? "0 0 40px rgba(79,70,229,0.08)" : "none",
                transition: "all 200ms", display: "flex", flexDirection: "column",
                cursor: "pointer",
              }} onClick={() => !loading && setSelected(plan.id)}>

                {/* Badge */}
                {(isRec || plan.badge) && (
                  <div style={{ background: isRec ? "var(--v)" : "var(--ink-3)", padding: "5px 0", textAlign: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isRec ? "#fff" : "var(--ink-4)", letterSpacing: "0.1em" }}>
                      {isRec ? "RECOMENDADO PARA O SEU PERFIL" : plan.badge?.toUpperCase()}
                    </span>
                  </div>
                )}

                <div style={{ padding: "22px 24px 0", flex: 1 }}>
                  {/* Plan name */}
                  <p style={{ fontSize: 10, fontWeight: 700, color: isSel ? "var(--v-hi)" : "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                    AXIOM {plan.name}
                  </p>

                  {/* Pricing */}
                  {plan.hasPromo && plan.priceFrom ? (
                    <div style={{ marginBottom: 8 }}>
                      {/* Promo badge */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.18)", borderRadius: 10, padding: "4px 12px", marginBottom: 10 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", letterSpacing: "0.08em" }}>OFERTA DE LANÇAMENTO</span>
                      </div>
                      {/* Struck price */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, color: "var(--ink-4)", textDecoration: "line-through", fontFamily: "'Space Grotesk',sans-serif" }}>
                          R$ {plan.priceFrom}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--red)", fontWeight: 600 }}>-39%</span>
                      </div>
                      {/* Final price */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 40, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.04em" }}>
                          R$ {plan.price}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>/mes</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 40, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.04em" }}>
                        R$ {plan.price}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--ink-3)" }}>/mes</span>
                    </div>
                  )}

                  <p style={{ fontSize: 12, color: "var(--ink-4)", marginBottom: 2 }}>{plan.limit}</p>
                  <p style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>{plan.overage}</p>
                  <p style={{ fontSize: 11, color: "var(--green)", marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    ↗ {plan.saving}
                  </p>

                  {/* Features */}
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ color: isSel ? "var(--v-hi)" : "var(--v)", fontSize: 12, flexShrink: 0, marginTop: 2 }}>✓</span>
                      <p style={{ fontSize: 12, color: isSel ? "var(--ink-4)" : "var(--ink-4)", lineHeight: 1.45, margin: 0 }}>{f}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ padding: "16px 24px 22px" }}>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleCheckout(plan.id) }}
                    disabled={loading}
                    style={{
                      width: "100%", height: 42, border: "none", borderRadius: 6,
                      background: isLoading ? "rgba(79,70,229,0.6)" : isSel ? "var(--v)" : "rgba(255,255,255,0.05)",
                      color: isSel || isLoading ? "#fff" : "var(--ink-3)",
                      fontSize: 13, fontWeight: 600,
                      fontFamily: "'Space Grotesk',sans-serif",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 200ms", outline: "none",
                      border: isSel ? "none" : "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    } as React.CSSProperties}
                  >
                    {isLoading ? (
                      <><Spin /> Preparando ambiente...</>
                    ) : isSel ? (
                      "Começar 7 dias grátis →"
                    ) : (
                      "Selecionar este plano"
                    )}
                  </button>

                  {/* Selected indicator */}
                  {isSel && !isLoading && (
                    <p style={{ fontSize: 11, color: "var(--v-hi)", textAlign: "center", marginTop: 8 }}>
                      ✓ Selecionado — clique acima para continuar
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
            7 dias grátis em todos os planos &middot; Cancele quando quiser &middot; Sem taxa de configuração
          </p>
          <p style={{ fontSize: 11, color: "var(--ink-3)" }}>
            Você pode trocar de plano a qualquer momento pelo painel de conta.
          </p>
        </div>
      </div>
    </div>
  )
}

function Spin() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  )
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--side-bg)" }} />}>
      <PlanosContent />
    </Suspense>
  )
}
