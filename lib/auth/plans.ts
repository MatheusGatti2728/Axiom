// ================================================================
// AXIOM -- Plan definitions (single source of truth)
// ================================================================

export type PlanId = "core" | "intelligence" | "operations" | "enterprise" | "alphaville"

export interface Plan {
  id:               PlanId
  name:             string
  priceDisplay:     string
  priceCents:       number
  stripePriceId:    string
  monthlyLimit:     number
  overagePer100:    number
  recommended?:     boolean
  featuresIn:       string[]
  featuresOut:      string[]
  badge?:           string
}

// Returns plans with env vars resolved at RUNTIME (not build time)
export function getPlans(): Record<PlanId, Plan> {
  return {
    core: {
      id:            "core",
      name:          "AXIOM Core",
      priceDisplay:  "R$ 197",
      priceCents:    19700,
      stripePriceId: process.env.STRIPE_PRICE_CORE ?? "",
      monthlyLimit:  500,
      overagePer100: 3900,
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

    intelligence: {
      id:            "intelligence",
      name:          "AXIOM Intelligence",
      priceDisplay:  "R$ 497",
      priceCents:    49700,
      stripePriceId: process.env.STRIPE_PRICE_INTELLIGENCE ?? "",
      monthlyLimit:  1200,
      overagePer100: 3900,
      recommended:   true,
      badge:         "Mais popular",
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
        "Monitoramento continuo",
      ],
    },

    operations: {
      id:            "operations",
      name:          "AXIOM Operations",
      priceDisplay:  "R$ 1.490",
      priceCents:    149000,
      stripePriceId: process.env.STRIPE_PRICE_OPERATIONS ?? "",
      monthlyLimit:  5000,
      overagePer100: 2500,
      featuresIn: [
        "5.000 analises estrategicas por mes",
        "Tudo do Intelligence incluido",
        "Multiusuario - ate 10 seats",
        "Analytics e relatorios de equipe",
        "Historico de dossies e CRM basico",
        "Monitoramento continuo de empresas",
        "Exportacoes enterprise ilimitadas",
        "Suporte prioritario",
      ],
      featuresOut: [],
    },

    enterprise: {
      id:            "enterprise",
      name:          "AXIOM Enterprise",
      priceDisplay:  "Sob consulta",
      priceCents:    0,
      stripePriceId: "",
      monthlyLimit:  999999,
      overagePer100: 0,
      featuresIn: [
        "Volume ilimitado de analises",
        "White label e customizacao",
        "API de integracao",
        "Implantacao e treinamento",
        "SLA garantido",
        "Gerente de conta dedicado",
      ],
      featuresOut: [],
    },
  }
}

// Convenience: get a single plan by ID
export function getPlan(planId?: string | null): Plan {
  const plans = getPlans()
  return plans[(planId as PlanId) ?? "core"] ?? plans.core
}

export function getPlanByStripePrice(stripePriceId: string): Plan | null {
  return Object.values(getPlans()).find(p => p.stripePriceId === stripePriceId) ?? null
}

// Month key for usage tracking: "2026-05"
export function getMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
