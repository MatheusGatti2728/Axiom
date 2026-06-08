"use client"
// AXIOM -- Playbook v5
// Psychology-first. Institutional advisory tone.
// Built around: Fiscal, Contador, Advogado, Financeiro.

import { useState } from "react"
import type { UnifiedCopilotOutput } from "@/src/sales/unified-copilot-engine"

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false)
  const safe = text ?? ""
  return (
    <button onClick={() => { try { navigator.clipboard.writeText(safe) } catch {} setOk(true); setTimeout(() => setOk(false), 1500) }}
      className="copy-btn">{ok ? "✓" : "Copiar"}</button>
  )
}

type Sub = "antes" | "perfil" | "conducao" | "whatsapp" | "objecoes" | "email" | "perguntas" | "pos"
const SUBS: Array<{ key: Sub; label: string }> = [
  { key: "antes",     label: "Antes de Ligar" },
  { key: "perfil",    label: "Por Perfil" },
  { key: "conducao",  label: "Condução" },
  { key: "whatsapp",  label: "WhatsApp" },
  { key: "objecoes",  label: "Objeções" },
  { key: "email",     label: "E-mail" },
  { key: "perguntas", label: "Perguntas" },
  { key: "pos",       label: "Pós-Ligação" },
]

// -- Persona profiles with full psychology ---------------------------------

const PERSONAS = {
  fiscal: {
    label:    "Responsável Fiscal",
    role:     "Gerente Fiscal · Coordenador Tributário",
    mindset:  "Técnico, defensivo, orientado a risco. Protege a operação acima de tudo.",
    fear:     "Ser responsabilizado por algo que passou. Perder controle da situação fiscal. Ser exposto por uma análise externa.",
    goal:     "Gerar colaboração técnica — não confronto. Posicionar-se como atualização jurisprudencial, nunca como diagnóstico de erro.",
    unlock:   "Falar de movimentações recentes do STJ/STF. Usar linguagem de 'revisão complementar'. Validar o trabalho atual antes de propor adições.",
    avoid:    ["vocês perderam", "ninguém viu", "erro fiscal", "recuperação milionária", "deixou passar", "o escritório de vocês"],
    use:      ["atualização jurisprudencial", "mudança interpretativa recente", "revisão técnica complementar", "entender a aderência operacional"],
    opening:  "Não estamos assumindo que exista crédito. A ideia é entender se algumas movimentações recentes do STJ podem fazer sentido dentro da operação de vocês.",
    conduct:  "Comece com contexto de mercado. Nunca com diagnóstico. Pergunte antes de afirmar. Apresente como análise, não como venda.",
    cta:      "Se fizer sentido, podemos marcar 30 minutos técnico a técnico para detalhar o que identificamos. Sem compromisso.",
    color:    "var(--v)",
    badge:    "Técnico",
  },
  contador: {
    label:    "Contador",
    role:     "Contador · Escritório Contábil · Responsável Contábil",
    mindset:  "Extremamente sensível a ameaças à sua posição. Medo de perder o cliente. Alta resistência inicial.",
    fear:     "Ser visto como negligente. Perder o cliente para outra assessoria. Ser substituído ou contornado.",
    goal:     "Transformar o contador em aliado interno — não em obstáculo. Coautoria, parceria, complemento.",
    unlock:   "Linguagem de parceria e apoio técnico especializado. Deixar claro que não é concorrência — é complemento. O contador permanece como referência do cliente.",
    avoid:    ["o que vocês não viram", "análise que faltou", "recuperar o que ficou para trás", "teses que o contador normalmente não cobre"],
    use:      ["análise conjunta", "tese específica fora do escopo contábil habitual", "trabalho complementar", "você continua sendo a referência"],
    opening:  "Nosso trabalho normalmente complementa a operação do contador, principalmente em teses muito específicas e recentes — temas que requerem análise processual além do escopo contábil habitual.",
    conduct:  "Posicione-se como especialização, não como generalismo. Fale de teses processuais e jurisprudências recentes — território que o contador respeita como alheio ao seu escopo.",
    cta:      "A ideia seria uma conversa técnica conjunta — você, eu e quem mais fizer sentido — para avaliar se essa análise complementar faz sentido para o cliente.",
    color:    "var(--green)",
    badge:    "Colaborativo",
  },
  advogado: {
    label:    "Advogado",
    role:     "Advogado Tributário · Jurídico · Assessor Jurídico",
    mindset:  "Cético, analítico, orientado a jurisprudência. Rejeita urgência e marketing. Respeita fundamento.",
    fear:     "Comprometer-se com tese sem análise processual. Expor o cliente a risco jurídico mal calculado. Recomendar algo que prejudique sua reputação.",
    goal:     "Ganhar legitimidade técnica. Falar a mesma língua: fundamento, processo, precedente, risco.",
    unlock:   "Trazer temas STJ/STF com numeração correta. Falar de aderência operacional antes de falar de valor. Postura institucional e analítica.",
    avoid:    ["taxa de sucesso garantida", "retorno rápido", "processo simples", "sem risco nenhum", "a empresa está deixando dinheiro na mesa"],
    use:      ["aderência operacional", "análise de precedentes", "risco processual mapeado", "fundamentação STJ/STF", "validação jurídica antes de qualquer proposta"],
    opening:  "Estamos apenas validando aderência operacional antes de aprofundar qualquer discussão jurídica. A ideia é entender se os precedentes recentes do STJ se aplicam ao perfil operacional de vocês.",
    conduct:  "Nunca use urgência. Nunca use gatilho emocional. Vá direto ao fundamento. Apresente o tema, o tribunal, o processo e o risco — nessa ordem.",
    cta:      "Se fizer sentido uma análise jurídica mais detalhada, posso compartilhar o mapeamento que fizemos antes de qualquer reunião.",
    color:    "var(--yellow)",
    badge:    "Analítico",
  },
  financeiro: {
    label:    "Responsável Financeiro",
    role:     "CFO · Diretor Financeiro · Controller · Gerente Financeiro",
    mindset:  "Pragmático, orientado a caixa e ROI. Menos emocional. Quer números e impacto real.",
    fear:     "Comprometer-se com algo sem retorno claro. Gerar surpresa no fluxo de caixa. Aprovar algo que gere problema com a operação ou com a diretoria.",
    goal:     "Mostrar impacto financeiro sem parecer oportunista. Ancorar em eficiência, não em descoberta de erro.",
    unlock:   "Falar de eficiência tributária, monetização de créditos, redução de passivo. Apresentar como melhoria de posição financeira — não como correção.",
    avoid:    ["vocês têm dinheiro parado", "deixaram de receber", "prejuízo acumulado", "quanto vocês perderam em X anos"],
    use:      ["eficiência tributária", "monetização de créditos existentes", "melhoria de posição de caixa", "previsibilidade", "ROI mensurável"],
    opening:  "Algumas empresas do segmento estão revisando temas específicos para melhorar eficiência financeira sem alterar operação. Com base no perfil de vocês, identificamos alguns pontos que podem ser relevantes.",
    conduct:  "Vá direto ao impacto financeiro. Use números reais quando disponíveis. Fale de prazo, processo e risco com clareza. Não romantize.",
    cta:      "Se quiser, posso compartilhar uma estimativa preliminar baseada no perfil de vocês — para avaliar se vale aprofundar.",
    color:    "var(--ink-2)",
    badge:    "Financeiro",
  },
}

// -- Objection intelligence -------------------------------------------------

const OBJECTIONS = [
  {
    trigger:    "Já temos escritório tributário",
    real_meaning: "Estou protegendo minha estrutura atual e sinalizando que não preciso de mais ninguém.",
    risk:       "Se você recuar ou concordar passivamente, a conversa termina.",
    response:   "Faz total sentido. O que identificamos são teses muito específicas e recentes — normalmente fora do escopo de acompanhamento contínuo. A proposta não é substituir, é uma análise pontual complementar.",
    never_say:  "O escritório de vocês não viu isso.",
    keep_open:  "Você não precisa mudar nada. A ideia é apenas validar se esses temas específicos já foram analisados dentro do contexto operacional de vocês.",
  },
  {
    trigger:    "Nosso contador já cuida disso",
    real_meaning: "Estou protegendo o contador — ou não quero assumir responsabilidade por uma análise.",
    risk:       "Contrapor o contador cria ruptura imediata e gera resistência.",
    response:   "Com certeza. O que trazemos é uma análise processual específica — teses muito novas, com decisões de 2023/2024 — que normalmente estão fora do escopo contábil habitual. A ideia seria uma conversa conjunta, inclusive com ele.",
    never_say:  "Teses que o contador normalmente não acompanha.",
    keep_open:  "Seria muito mais produtivo envolver o contador na conversa. Ele teria o contexto operacional que facilita a análise.",
  },
  {
    trigger:    "Não temos interesse no momento",
    real_meaning: "Não entendi o que você está oferecendo, ou o timing não é ideal, ou você soou como vendedor.",
    risk:       "Insistir aqui fecha a porta definitivamente.",
    response:   "Entendo. Não estou propondo nada para fechar agora — apenas validar se faz sentido uma análise técnica específica. Se não for o momento, posso entrar em contato em outro trimestre.",
    never_say:  "Mas espera — deixa eu explicar melhor.",
    keep_open:  "Posso deixar um resumo por e-mail? Apenas para ter como referência quando o momento for oportuno.",
  },
  {
    trigger:    "Manda material",
    real_meaning: "Estou encerrando a ligação de forma educada. Não foi gerado interesse suficiente.",
    risk:       "Se você apenas mandar e-mail, 99% de chance de não ter resposta.",
    response:   "Claro. Antes de enviar, quero garantir que o material faça sentido para vocês — posso fazer duas perguntas rápidas para direcionar melhor o que vou enviar?",
    never_say:  "Ótimo! Vou mandar agora.",
    keep_open:  "Assim o e-mail vai ter contexto real da operação de vocês, não um material genérico.",
  },
  {
    trigger:    "Isso gera risco?",
    real_meaning: "Estou interessado, mas preciso de segurança antes de avançar.",
    risk:       "Minimizar o risco sem fundamentar pode gerar desconfiança. Exagerar o risco encerra a conversa.",
    response:   "Essa é exatamente a pergunta certa. As teses que estamos analisando têm precedente consolidado no STJ — o que reduz significativamente o risco processual. Mas o risco sempre precisa ser avaliado dentro da sua operação específica, o que faz parte da análise que propomos.",
    never_say:  "Sem risco nenhum." ,
    keep_open:  "É justamente por isso que propomos uma análise antes de qualquer proposta — para mapear aderência e risco antes de qualquer decisão.",
  },
  {
    trigger:    "Já analisamos e não se aplica",
    real_meaning: "Provavelmente foi analisado de forma diferente, ou em outro momento — mas não vou admitir isso.",
    risk:       "Contrariar diretamente cria atrito de ego.",
    response:   "Faz sentido. Essas análises dependem muito do contexto operacional e do momento — algumas interpretações mudaram com decisões recentes do STJ. A ideia não seria refazer uma análise, mas verificar se as mudanças de 2023/2024 alteraram o cenário.",
    never_say:  "Mas a análise de vocês pode estar desatualizada.",
    keep_open:  "Se a análise foi feita antes de 2023, vale uma atualização rápida — as decisões recentes mudaram bastante o entendimento.",
  },
  {
    trigger:    "Não temos tempo agora",
    real_meaning: "Não é prioridade ou não vi valor suficiente.",
    risk:       "Aceitar passivamente encerra a conversa.",
    response:   "Entendo perfeitamente. Posso agendar algo para a próxima semana? São 20 minutos — sem apresentação, diretamente nos pontos técnicos identificados.",
    never_say:  "Mas é rápido! Só 5 minutinhos.",
    keep_open:  "Qual seria o melhor dia e horário para você nas próximas duas semanas?",
  },
]


// -- Persona scoring: who has highest opening chance based on result data ----
function calcPersonaScores(result: any, makers: any[]): Record<string, number> {
  const legal       = result?.legal_intelligence
  const timing      = result?.timing_intelligence
  const mods        = result?.engine_result?.recommended ?? []
  const hasLegal    = legal?.findings?.length > 0
  const hasHighMat  = legal?.maturity_level === "high" || legal?.maturity_level === "medium"
  const isQuente    = timing?.temperature === "quente"
  const hasCFO      = makers.some((m: any) => (m.role ?? "").toLowerCase().includes("cfo") || (m.role ?? "").toLowerCase().includes("financeiro") || (m.role ?? "").toLowerCase().includes("diretor"))
  const hasContador = makers.some((m: any) => (m.role ?? "").toLowerCase().includes("conta") || (m.role ?? "").toLowerCase().includes("fiscal"))
  const hasAdvogado = makers.some((m: any) => (m.role ?? "").toLowerCase().includes("advog") || (m.role ?? "").toLowerCase().includes("juríd"))
  const bigPotential= (result?.financial_calculations?.[0]?.retroativo_5y?.provavel ?? 0) > 500000

  return {
    fiscal:     50 + (hasLegal ? 20 : 0) + (hasContador ? 15 : 0) + (hasHighMat ? 15 : 0),
    contador:   45 + (hasContador ? 25 : 0) + (!hasAdvogado ? 10 : 0) + (mods.length > 2 ? 10 : 0),
    advogado:   35 + (hasAdvogado ? 30 : 0) + (hasLegal ? 20 : 0) + (hasHighMat ? 15 : 0),
    financeiro: 40 + (hasCFO ? 25 : 0) + (bigPotential ? 20 : 0) + (isQuente ? 10 : 0),
  }
}

export function UnifiedCopilotPanel({
  copilot: c,
  result,
  onSubChange,
}: {
  copilot: UnifiedCopilotOutput
  result?: any
  onSubChange?: (sub: string) => void
}) {
  const [sub, setSub] = useState<Sub>("antes")
  const [activePersona, setActivePersona] = useState<keyof typeof PERSONAS>("fiscal")
  const [renderError, setRenderError] = useState<string | null>(null)

  const beh          = c?.behavioral
  const preCM        = beh?.pre_call_mentality
  const openingOpp   = beh?.opening_opportunity
  const waFlows      = beh?.whatsapp_flows
  const personaGuide = beh?.persona_guide

  const makers = result?.enriched_linkedin_makers ?? result?.enriched_makers ?? []
  const topMaker = makers[0]
  const topMod = result?.engine_result?.recommended?.[0]
  const legal = result?.legal_intelligence
  const timing = result?.timing_intelligence
  const topOpp = topMod?.name ?? ""
  const potentialRaw = result?.financial_calculations?.[0]?.retroativo_5y?.provavel ?? 0
  const potFmt = potentialRaw >= 1_000_000 ? `R$ ${(potentialRaw/1_000_000).toFixed(1)}M` : potentialRaw >= 1_000 ? `R$ ${Math.round(potentialRaw/1_000)}k` : null
  const companyName = result?.company_name ?? ""
  const cnpj = result?.cnpj ?? ""

  // Persona scores
  const pScores = calcPersonaScores(result ?? {}, makers)
  const bestPersona = (Object.entries(pScores).sort((a,b) => b[1]-a[1])[0]?.[0] ?? "fiscal") as keyof typeof PERSONAS

  const persona = PERSONAS[activePersona] ?? PERSONAS.fiscal

  if (renderError) return (
    <div style={{ padding: "40px 0" }}>
      <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 8 }}>Erro ao renderizar o Playbook.</p>
      <p style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "'JetBrains Mono',monospace" }}>{renderError}</p>
      <button onClick={() => setRenderError(null)} style={{ marginTop: 12, fontSize: 11, color: "var(--v)", background: "none", border: "none", cursor: "pointer" }}>Tentar novamente</button>
    </div>
  )
  if (!c) return <div style={{ padding: "40px", color: "var(--ink-3)", fontSize: 13 }}>Carregando playbook...</div>

  return (
    <div>
      {/* Sub-tab strip */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "1px solid var(--rule)",
        marginBottom: 32, overflowX: "auto",
      }}>
        {SUBS.map(s => (
          <button
            key={s.key}
            onClick={() => { setSub(s.key); onSubChange?.(s.key) }}
            style={{
              padding: "11px 18px 9px", border: "none",
              borderBottom: `2px solid ${sub === s.key ? "var(--v)" : "transparent"}`,
              background: "none", cursor: "pointer", whiteSpace: "nowrap",
              marginBottom: -1,
            }}
          >
            <span style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: 12,
              fontWeight: sub === s.key ? 500 : 400,
              color: sub === s.key ? "var(--ink-1)" : "var(--ink-3)",
              letterSpacing: "-0.01em",
              transition: "color 120ms",
            }}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* -- 1. ANTES DE LIGAR ----------------------------------- */}
      {sub === "antes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* ── A. PERSONALIZED BRIEF ──────────────────────── */}
          <div style={{ padding: "20px 24px", background: "var(--v-wash)", border: "1px solid var(--v-border)" }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--v)", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 12 }}>
              Briefing desta abordagem
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 32px", marginBottom: potFmt || topMaker || timing ? 16 : 0 }}>
              {topMaker && (
                <div>
                  <p style={{ fontSize: 9, color: "var(--v)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 5, fontFamily: "'JetBrains Mono',monospace" }}>Abordar primeiro</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>{topMaker.name}</p>
                  <p style={{ fontSize: 11, color: "var(--ink-3)" }}>{topMaker.role}</p>
                </div>
              )}
              {topOpp && (
                <div>
                  <p style={{ fontSize: 9, color: "var(--v)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 5, fontFamily: "'JetBrains Mono',monospace" }}>Gancho principal</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>{topOpp}</p>
                  {potFmt && <p style={{ fontSize: 11, color: "var(--green)" }}>Potencial: {potFmt}</p>}
                </div>
              )}
              {timing && (
                <div>
                  <p style={{ fontSize: 9, color: "var(--v)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 5, fontFamily: "'JetBrains Mono',monospace" }}>Timing</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: timing.temperature === "quente" ? "var(--red)" : timing.temperature === "morno" ? "var(--yellow)" : "var(--ink-4)" }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.02em", textTransform: "capitalize" as const }}>{timing.temperature ?? "Neutro"}</p>
                  </div>
                  {timing.timing_signal && <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>{timing.timing_signal.slice(0, 60)}</p>}
                </div>
              )}
            </div>
            {/* Recommended persona */}
            <div style={{ paddingTop: 14, borderTop: "1px solid var(--v-border)" }}>
              <p style={{ fontSize: 9, color: "var(--v)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>
                Perfil recomendado para iniciar
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                {(Object.entries(pScores).sort((a,b) => b[1]-a[1]) as [keyof typeof PERSONAS, number][]).map(([key, score]) => {
                  const p = PERSONAS[key]
                  const isBest = key === bestPersona
                  return (
                    <button key={key} onClick={() => { setActivePersona(key); setSub("perfil"); onSubChange?.("perfil") }} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 14px",
                      background: isBest ? "var(--v)" : "transparent",
                      border: `1px solid ${isBest ? "var(--v)" : "var(--v-border)"}`,
                      cursor: "pointer", transition: "all 120ms",
                    }}>
                      <span style={{ fontSize: 12, fontWeight: isBest ? 600 : 400, color: isBest ? "#fff" : "var(--ink-2)" }}>{p.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: isBest ? "rgba(255,255,255,0.7)" : "var(--ink-4)" }}>{score}%</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mental preparation */}
          <div>
            <p className="t-label" style={{ marginBottom: 16 }}>Preparação mental</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Esta não é uma ligação de vendas — é uma ligação de inteligência.",
                "O objetivo da primeira ligação é gerar curiosidade técnica, não fechar.",
                "Nunca usar oportunidades como diagnóstico de erro. Usar como ponto de contexto.",
                "Evitar frases que coloquem o interlocutor na defensiva antes do primeiro minuto.",
                "Tom: calmo, técnico, consultivo e seguro.",
              ].map((rule, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--rule)" }}>
                  <span style={{ color: "var(--green)", fontSize: 11, flexShrink: 0, marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>✓</span>
                  <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <p className="t-label" style={{ marginBottom: 14 }}>Checklist antes de ligar</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { item: "Oportunidade prioritária identificada", done: !!topOpp, detail: topOpp || "Verificar aba Oportunidades" },
                { item: "Decisor identificado pelo nome", done: !!topMaker?.name, detail: topMaker?.name ? `${topMaker.name} — ${topMaker.role}` : "Verificar aba Pessoas" },
                { item: "Histórico jurídico revisado", done: !!(legal && legal.maturity_level !== "none"), detail: legal?.maturity_label?.slice(0, 60) || "Verificar aba Histórico" },
                { item: "Tese prioritária e linguagem revisada", done: !!topMod?.curiosity_trigger, detail: topMod?.curiosity_trigger?.slice(0, 60) || "Verificar oportunidade principal" },
                { item: "Sinais operacionais verificados", done: true, detail: "Revisar aba Contexto" },
                { item: "Tom ajustado ao perfil do interlocutor", done: false, detail: "Selecionar perfil na aba Por Perfil" },
              ].map((c2, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 14px",
                  background: c2.done ? "var(--green-wash)" : "var(--canvas)",
                  border: `1px solid ${c2.done ? "var(--green-border)" : "var(--rule)"}`,
                  borderRadius: "var(--r-md)",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginTop: 1,
                    background: c2.done ? "var(--green)" : "transparent",
                    border: `1px solid ${c2.done ? "var(--green)" : "var(--rule-mid)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {c2.done && <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: c2.done ? "var(--ink-1)" : "var(--ink-3)", marginBottom: 2 }}>{c2.item}</p>
                    <p style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "'JetBrains Mono',monospace" }}>{c2.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Psychological alerts */}
          <div>
            <p className="t-label" style={{ marginBottom: 14 }}>Alertas psicológicos por perfil</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { perfil: "Fiscal / Tributário", alerta: "Protege território técnico. Qualquer insinuação de erro gera rejeição imediata. Falar sempre de 'atualização' e 'revisão complementar'." },
                { perfil: "Contador", alerta: "Medo de ser substituído. Alta sensibilidade. Nunca contorná-lo — incluí-lo é a chave. A abordagem de parceria reduz a resistência em 80%." },
                { perfil: "Advogado", alerta: "Cético por formação. Rejeita urgência e marketing. Responde a fundamento técnico, jurisprudência e análise de risco processual." },
                { perfil: "Financeiro / CFO", alerta: "Pragmático. Quer números e impacto em caixa. Sem romantismo — direto ao ROI. Pior erro é falar em 'oportunidade' sem embasamento financeiro." },
              ].map((a, i) => (
                <div key={i} style={{ padding: "12px 16px", background: "var(--lift)", borderRadius: "var(--r-md)", borderLeft: "2px solid var(--rule-mid)" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>{a.perfil}</p>
                  <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>{a.alerta}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Opening opportunity */}
          {openingOpp && (
            <div style={{ padding: "20px 24px", border: "1px solid var(--v-border)", background: "var(--v-wash)", borderRadius: "var(--r-lg)" }}>
              <p className="t-label" style={{ marginBottom: 6, color: "var(--v)" }}>Melhor porta de entrada identificada</p>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.025em", marginBottom: 8 }}>
                {openingOpp.name}
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 14 }}>{openingOpp.why_first}</p>
              <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 14 }}>
                <p className="t-label" style={{ marginBottom: 6 }}>Linha de curiosidade</p>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <p style={{ fontSize: 13, color: "var(--ink-1)", fontStyle: "italic", lineHeight: 1.7, flex: 1 }}>"{openingOpp.curiosity_line}"</p>
                  <CopyBtn text={openingOpp.curiosity_line} />
                </div>
              </div>
            </div>
          )}

          {/* Legal context alert */}
          {legal?.maturity_level && legal.maturity_level !== "none" && (
            <div style={{ padding: "16px 20px", borderLeft: "2px solid var(--v)", background: "var(--v-wash)", borderRadius: "var(--r-md)" }}>
              <p className="t-label" style={{ marginBottom: 6, color: "var(--v)" }}>Contexto jurídico ativo</p>
              <p style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.7 }}>{legal.approach_shift}</p>
            </div>
          )}
        </div>
      )}

      {/* -- 2. POR PERFIL --------------------------------------- */}
      {sub === "perfil" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Persona selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            {(Object.keys(PERSONAS) as Array<keyof typeof PERSONAS>).map(key => {
              const p = PERSONAS[key]
              const active = activePersona === key
              return (
                <button key={key} onClick={() => setActivePersona(key)} style={{
                  padding: "8px 16px", border: `1px solid ${active ? p.color : "var(--rule-mid)"}`,
                  background: active ? "var(--lift)" : "transparent",
                  cursor: "pointer", borderRadius: "var(--r-md)", transition: "all 120ms",
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
                }}>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "var(--ink-1)" : "var(--ink-3)", fontFamily: "'Space Grotesk',sans-serif" }}>
                    {p.label}
                  </span>
                  <span style={{ fontSize: 9.5, color: active ? p.color : "var(--ink-4)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.03em" }}>
                    {p.badge}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active persona detail */}
          <div>
            {/* Header */}
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--rule)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: persona.color }} />
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.03em" }}>
                  {persona.label}
                </h3>
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-4)", fontFamily: "'JetBrains Mono',monospace" }}>{persona.role}</p>
            </div>

            {/* Grid: mindset + goal */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: "18px 20px", background: "var(--lift)", borderRadius: "var(--r-lg)" }}>
                <p className="t-label" style={{ marginBottom: 8 }}>Comportamento esperado</p>
                <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65 }}>{persona.mindset}</p>
              </div>
              <div style={{ padding: "18px 20px", background: "var(--lift)", borderRadius: "var(--r-lg)" }}>
                <p className="t-label" style={{ marginBottom: 8 }}>Objetivo psicológico</p>
                <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65 }}>{persona.goal}</p>
              </div>
            </div>

            {/* Fear + Unlock */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: "16px 20px", borderLeft: "2px solid var(--red)", background: "var(--red-wash)", borderRadius: "var(--r-md)" }}>
                <p className="t-label" style={{ marginBottom: 6, color: "var(--red)" }}>O que teme</p>
                <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6 }}>{persona.fear}</p>
              </div>
              <div style={{ padding: "16px 20px", borderLeft: "2px solid var(--green)", background: "var(--green-wash)", borderRadius: "var(--r-md)" }}>
                <p className="t-label" style={{ marginBottom: 6, color: "var(--green)" }}>O que desbloqueia o interesse</p>
                <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6 }}>{persona.unlock}</p>
              </div>
            </div>

            {/* Avoid / Use */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ padding: "16px 20px", background: "var(--lift)", borderRadius: "var(--r-lg)" }}>
                <p className="t-label" style={{ marginBottom: 10, color: "var(--red)" }}>Palavras e frases proibidas</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(persona.avoid ?? []).map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--red)", fontSize: 11, flexShrink: 0, marginTop: 1 }}>✕</span>
                      <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, fontStyle: "italic" }}>"{a}"</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "16px 20px", background: "var(--lift)", borderRadius: "var(--r-lg)" }}>
                <p className="t-label" style={{ marginBottom: 10, color: "var(--green)" }}>Linguagem recomendada</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(persona.use ?? []).map((u, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--green)", fontSize: 11, flexShrink: 0, marginTop: 1 }}>→</span>
                      <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{u}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Opening + Conduct + CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "18px 22px", background: "var(--v-wash)", border: "1px solid var(--v-border)", borderRadius: "var(--r-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p className="t-label" style={{ color: "var(--v)" }}>Abertura recomendada</p>
                  <CopyBtn text={persona.opening} />
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.75, fontStyle: "italic" }}>"{persona.opening}"</p>
              </div>
              <div style={{ padding: "16px 20px", background: "var(--lift)", borderRadius: "var(--r-lg)" }}>
                <p className="t-label" style={{ marginBottom: 8 }}>Como conduzir</p>
                <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65 }}>{persona.conduct}</p>
              </div>
              <div style={{ padding: "16px 20px", background: "var(--lift)", border: "1px solid var(--rule)", borderRadius: "var(--r-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p className="t-label">CTA suave</p>
                  <CopyBtn text={persona.cta} />
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.65, fontStyle: "italic" }}>"{persona.cta}"</p>
              </div>
            </div>

            {/* Context-specific if top opportunity available */}
            {topOpp && (
              <div style={{ marginTop: 16, padding: "16px 20px", borderLeft: "2px solid var(--v-border)", background: "var(--lift)", borderRadius: "var(--r-md)" }}>
                <p className="t-label" style={{ marginBottom: 6 }}>Gancho contextual — {persona.label}</p>
                <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.65 }}>
                  {activePersona === "fiscal" && `Para o fiscal: mencione que se trata de uma discussão sobre ${topOpp} — foque no movimento recente do STJ, não no valor potencial.`}
                  {activePersona === "contador" && `Para o contador: posicione a análise de ${topOpp} como especialização técnica processual — fora do escopo contábil regular.`}
                  {activePersona === "advogado" && `Para o advogado: traga a fundamentação jurídica de ${topOpp} com referência ao processo e tribunal específico.`}
                  {activePersona === "financeiro" && `Para o financeiro: conecte ${topOpp} ao impacto em fluxo de caixa — apresente a estimativa preliminar como dado de análise.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- 3. CONDUÇÃO ----------------------------------------- */}
      {sub === "conducao" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

          {/* ── B. TIMING WINDOW ────────────────────────── */}
          {timing?.temperature && (
            <div style={{ marginBottom: 24, padding: "14px 18px", borderLeft: `3px solid ${timing.temperature === "quente" ? "var(--red)" : timing.temperature === "morno" ? "var(--yellow)" : "var(--rule-mid)"}`, background: timing.temperature === "quente" ? "var(--red-wash)" : timing.temperature === "morno" ? "var(--yellow-wash)" : "var(--lift)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: timing.temperature === "quente" ? "var(--red)" : timing.temperature === "morno" ? "var(--yellow)" : "var(--ink-4)" }} />
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-1)", textTransform: "capitalize" as const }}>Janela de timing: {timing.temperature}</p>
              </div>
              {timing.timing_signal && <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.65 }}>{timing.timing_signal}</p>}
              {timing.temperature === "quente" && (
                <p style={{ fontSize: 11, color: "var(--red)", marginTop: 6, fontWeight: 500 }}>
                  → Empresa em momento favorável. Use este sinal na abertura da ligação para criar relevância imediata.
                </p>
              )}
            </div>
          )}

          {[
            {
              step: "01", label: "Abertura",
              objetivo: "Criar contexto de mercado — não de vendas",
              fala: c.call_flow?.opening || "Estou acompanhando algumas movimentações tributárias relevantes para o setor — principalmente temas com impacto financeiro real e baixo risco operacional.",
              risco: "Abrir com produto ou valor gera defesa imediata",
              proibido: "\"Encontramos uma oportunidade de R$ X para vocês\"",
            },
            {
              step: "02", label: "Quebra de resistência",
              objetivo: "Demonstrar que você não é um vendedor — você é uma atualização técnica",
              fala: c.call_flow?.sector_context || "Não estou propondo nada ainda. Estou verificando se esses temas fazem sentido dentro do contexto operacional de vocês antes de qualquer análise mais profunda.",
              risco: "Ir rápido para produto antes de gerar rapport técnico",
              proibido: "\"Deixa eu te apresentar nossa solução\"",
            },
            {
              step: "03", label: "Geração de curiosidade",
              objetivo: "Plantar um gatilho técnico que o interlocutor queira entender",
              fala: c.call_flow?.curiosity_gap || openingOpp?.curiosity_line || "Identificamos algo específico no perfil de vocês que vale a pena detalhar — mas preciso de mais contexto operacional antes de afirmar qualquer coisa.",
              risco: "Revelar o valor antes de confirmar o interesse",
              proibido: "\"Identificamos R$ X de oportunidade para vocês\"",
            },
            {
              step: "04", label: "Validação operacional",
              objetivo: "Qualificar a aderência e gerar co-construção",
              fala: c.call_flow?.anchor_question || "Antes de aprofundar — vocês possuem operação relevante em [tema]? Isso define se a análise faz sentido.",
              risco: "Avançar sem confirmar aderência — perder tempo e credibilidade",
              proibido: "\"Com certeza se aplica para vocês\"",
            },
            {
              step: "05", label: "Pré-empt de objeção",
              objetivo: "Neutralizar resistências antes que apareçam",
              fala: c.call_flow?.pre_empt_objection || "Não estou propondo substituição de nada — apenas uma análise técnica pontual. Se não se aplicar, encerramos em 15 minutos.",
              risco: "Deixar a objeção chegar sem ter preparado o terreno",
              proibido: "\"Mas espera — deixa eu explicar melhor\"",
            },
            {
              step: "06", label: "CTA",
              objetivo: "Propor próximo passo com baixo comprometimento",
              fala: c.call_flow?.cta_primary || "Posso propor 30 minutos técnicos para detalhar o que identificamos — sem compromisso da parte de vocês. Qual seria o melhor dia?",
              risco: "CTA muito pesado — \"marcar uma reunião formal\" gera atrito",
              proibido: "\"Posso agendar uma apresentação completa?\"",
            },
          ].map((s, i, arr) => (
            <div key={i} style={{
              display: "flex", gap: 20, padding: "24px 0",
              borderBottom: i < arr.length - 1 ? "1px solid var(--rule)" : "none",
              position: "relative",
            }}>
              {i < arr.length - 1 && (
                <div style={{ position: "absolute", left: 19, top: 56, width: 1, height: "calc(100% - 32px)", background: "var(--rule)" }} />
              )}
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: "var(--v-wash)", border: "1px solid var(--v-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--v)", fontWeight: 500 }}>{s.step}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ink-1)", marginBottom: 4, letterSpacing: "-0.02em" }}>{s.label}</p>
                <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12 }}>{s.objetivo}</p>
                <div style={{ padding: "12px 16px", background: "var(--lift)", borderRadius: "var(--r-md)", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-4)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Frase sugerida</p>
                    <CopyBtn text={s.fala} />
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.7, fontStyle: "italic" }}>"{s.fala}"</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, padding: "8px 12px", background: "var(--yellow-wash)", borderRadius: "var(--r-md)", borderLeft: "2px solid var(--yellow-border)" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "var(--yellow)", marginBottom: 3 }}>RISCO</p>
                    <p style={{ fontSize: 11, color: "var(--ink-3)" }}>{s.risco}</p>
                  </div>
                  <div style={{ flex: 1, padding: "8px 12px", background: "var(--red-wash)", borderRadius: "var(--r-md)", borderLeft: "2px solid var(--red-border)" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "var(--red)", marginBottom: 3 }}>NUNCA DIZER</p>
                    <p style={{ fontSize: 11, color: "var(--ink-3)", fontStyle: "italic" }}>{s.proibido}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -- 4. WHATSAPP ----------------------------------------- */}
      {sub === "whatsapp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Persona-specific messages */}
          <div>
            <p className="t-label" style={{ marginBottom: 16 }}>Mensagem por perfil do interlocutor</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" as const }}>
              {(Object.keys(PERSONAS) as Array<keyof typeof PERSONAS>).map(key => (
                <button key={key} onClick={() => setActivePersona(key)} style={{
                  padding: "6px 14px", border: `1px solid ${activePersona === key ? "var(--v)" : "var(--rule-mid)"}`,
                  background: activePersona === key ? "var(--v-wash)" : "transparent",
                  cursor: "pointer", borderRadius: "var(--r-md)", fontSize: 11.5,
                  color: activePersona === key ? "var(--v)" : "var(--ink-3)",
                  fontFamily: "'Inter',sans-serif", fontWeight: activePersona === key ? 500 : 400,
                }}>
                  {PERSONAS[key].label}
                </button>
              ))}
            </div>

            {/* Message templates per persona */}
            {[
              {
                key: "fiscal" as const,
                initial: topOpp
                  ? `Olá, [Nome]. Estou acompanhando algumas movimentações recentes do STJ relacionadas a ${topOpp}. Com base no perfil de vocês, achei relevante verificar se esse tema já foi analisado internamente. Quando tiver 20 minutos, podemos conversar?`
                  : `Olá, [Nome]. Estou acompanhando algumas interpretações recentes do STJ sobre contribuições federais que podem ser relevantes para o perfil de vocês. Quando tiver disponibilidade para uma conversa técnica rápida?`,
                followup: "Olá, [Nome]. Enviei uma mensagem há alguns dias sobre uma análise tributária específica. Se não foi o momento adequado, sem problema — posso entrar em contato no próximo trimestre ou quando for mais conveniente.",
                silence: "[Nome], entendo que o dia a dia é intenso. Só deixo registrado que a análise que identificamos tem prazo prescricional relevante. Se surgir uma janela, fico à disposição.",
              },
              {
                key: "contador" as const,
                initial: topOpp
                  ? `Olá, [Nome]. Trabalho com análise de teses tributárias específicas — principalmente discussões processuais recentes que normalmente estão fora do escopo contábil habitual. Identifiquei algo potencialmente relevante para um cliente seu. Podemos conversar sobre uma análise conjunta?`
                  : `Olá, [Nome]. Trabalho com teses tributárias específicas e recentes. Tenho identificado oportunidades em empresas do perfil dos seus clientes que normalmente ficam fora do escopo contábil regular. Poderia marcar uma conversa técnica?`,
                followup: "Olá, [Nome]. Retomando meu contato de alguns dias atrás. A análise pode ser feita em parceria com você — você mantém a referência com o cliente, e eu trago a especialização processual pontual.",
                silence: "[Nome], qualquer análise que fazermos seria em conjunto com você. Não é substituição — é complemento técnico especializado. Quando tiver disponibilidade.",
              },
              {
                key: "advogado" as const,
                initial: `[Nome], estou trabalhando com uma análise de aderência operacional sobre ${topOpp || "teses tributárias recentes do STJ"}. Antes de avançar para qualquer proposta jurídica, queria validar o contexto processual com quem conhece a operação da empresa. Teria disponibilidade para uma conversa técnica?`,
                followup: "[Nome], retomando contato. Posso enviar o mapeamento preliminar por e-mail para análise antes de qualquer conversa — assim você avalia a fundamentação antes de decidir se vale aprofundar.",
                silence: "[Nome], fica à vontade. Se surgir interesse futuro em revisar a aderência operacional das teses recentes do STJ, estou disponível.",
              },
              {
                key: "financeiro" as const,
                initial: topOpp
                  ? `Olá, [Nome]. Identifiquei algo no perfil financeiro de vocês que pode ter impacto em caixa sem alterar operação — relacionado a ${topOpp}. Algumas empresas do segmento já estão revisando esse tema. Quando tiver 20 minutos, posso apresentar uma estimativa preliminar?`
                  : `Olá, [Nome]. Acompanho empresas do segmento de vocês e identifiquei algumas oportunidades de eficiência tributária que têm gerado impacto relevante em caixa. Quando tiver disponibilidade para uma análise rápida?`,
                followup: "[Nome], retomando contato. Posso enviar uma estimativa preliminar por e-mail para você avaliar o tamanho do tema antes de qualquer conversa?",
                silence: "[Nome], entendo que não é prioridade agora. Fico à disposição quando o momento for mais adequado — o tema continua relevante.",
              },
            ].filter(t => t.key === activePersona).map((t) => (
              <div key={t.key} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Primeiro contato", timing: "D+0", msg: t.initial, note: "Objetivo: gerar curiosidade, não vender. Máximo 3 linhas." },
                  { label: "Follow-up elegante", timing: "D+3", msg: t.followup, note: "Não pressionar. Abrir nova possibilidade ou propor e-mail." },
                  { label: "Retomada após silêncio", timing: "D+7", msg: t.silence, note: "Tom de respeito ao tempo do interlocutor. Uma frase de abertura." },
                ].map((m, i) => (
                  <div key={i} style={{ border: "1px solid var(--rule)", background: "var(--canvas)", borderRadius: "var(--r-lg)" }}>
                    <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--rule)", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--v)", padding: "2px 7px", border: "1px solid var(--v-border)", borderRadius: 3 }}>{m.timing}</span>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-1)", flex: 1 }}>{m.label}</p>
                      <CopyBtn text={m.msg} />
                    </div>
                    <div style={{ padding: "16px 18px" }}>
                      <pre style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "var(--ink-1)", lineHeight: 1.8, whiteSpace: "pre-wrap" as const, margin: 0, marginBottom: 12 }}>{m.msg}</pre>
                      <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 10 }}>
                        <p style={{ fontSize: 11, color: "var(--ink-4)", fontStyle: "italic" }}>📌 {m.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* WA flows from engine */}
          {waFlows?.followups?.length > 0 && (
            <div>
              <p className="t-label" style={{ marginBottom: 14 }}>Fluxos adicionais</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {waFlows.followups.map((flow: any, fi: number) => (
                  <WaAccordion key={fi} flow={flow} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -- 5. OBJEÇÕES ----------------------------------------- */}
      {sub === "objecoes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: "12px 16px", background: "var(--lift)", borderRadius: "var(--r-md)", marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65 }}>
              Cada objeção carrega um significado real diferente do que foi dito. A resposta certa endereça o significado real — não as palavras literais.
            </p>
          </div>
          {(OBJECTIONS ?? []).map((obj, i) => (
            <div key={i} style={{ border: "1px solid var(--rule)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "14px 20px", background: "var(--lift)", borderBottom: "1px solid var(--rule)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--ink-4)", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.015em" }}>"{obj.trigger}"</p>
              </div>
              {/* Body */}
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Real meaning */}
                <div style={{ padding: "10px 14px", borderLeft: "2px solid var(--v)", background: "var(--v-wash)", borderRadius: "var(--r-md)" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "var(--v)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 4 }}>O que realmente quis dizer</p>
                  <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6, fontStyle: "italic" }}>{obj.real_meaning}</p>
                </div>
                {/* Risk */}
                <div style={{ padding: "8px 14px", borderLeft: "2px solid var(--yellow-border)", background: "var(--yellow-wash)", borderRadius: "var(--r-md)" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "var(--yellow)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 3 }}>Risco psicológico</p>
                  <p style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5 }}>{obj.risk}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Response */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <p className="t-label">Resposta institucional</p>
                      <CopyBtn text={obj.response} />
                    </div>
                    <p style={{ fontSize: 12, color: "var(--ink-1)", lineHeight: 1.7 }}>{obj.response}</p>
                  </div>
                  <div>
                    {/* Keep open */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <p className="t-label">Manter abertura</p>
                        <CopyBtn text={obj.keep_open} />
                      </div>
                      <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.65, fontStyle: "italic" }}>"{obj.keep_open}"</p>
                    </div>
                    {/* Never say */}
                    <div style={{ padding: "8px 12px", background: "var(--red-wash)", borderLeft: "2px solid var(--red-border)", borderRadius: "var(--r-md)" }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: "var(--red)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 3 }}>Nunca dizer</p>
                      <p style={{ fontSize: 11, color: "var(--ink-3)", fontStyle: "italic" }}>"{obj.never_say}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -- 6. E-MAIL -- */}
      {sub === "email" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {c.email ? (
            <>
              <div style={{ padding: "14px 18px", background: "var(--lift)", borderRadius: "var(--r-md)", border: "1px solid var(--rule)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <p className="t-label">Assunto</p>
                  {c.email.subject && <CopyBtn text={c.email.subject} />}
                </div>
                <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: "var(--ink-1)" }}>{c.email.subject ?? "—"}</p>
              </div>
              {([["E-mail direto (preferido)", c.email.body_short, true], ["E-mail formal", c.email.body_formal, false]] as [string, string, boolean][]).filter(([,v]) => v).map(([l, v, pref]) => (
                <div key={l} style={{ padding: "18px 20px", background: "var(--canvas)", border: `1px solid ${pref ? "var(--rule-mid)" : "var(--rule)"}`, borderRadius: "var(--r-lg)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <p className="t-label">{l}</p>
                    <CopyBtn text={v} />
                  </div>
                  <pre style={{ fontFamily: "inherit", fontSize: 13, color: "var(--ink-1)", lineHeight: 1.9, whiteSpace: "pre-wrap" as const, margin: 0 }}>{v}</pre>
                </div>
              ))}
              {c.email.ps && (
                <div style={{ padding: "12px 16px", borderLeft: "2px solid var(--v-border)", background: "var(--v-wash)", borderRadius: "var(--r-md)" }}>
                  <p className="t-label" style={{ marginBottom: 6 }}>P.S.</p>
                  <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.65 }}>{c.email.ps}</p>
                </div>
              )}
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink-3)", padding: "20px 0" }}>Use o Compositor de E-mail acima para gerar mensagens personalizadas.</p>
          )}
        </div>
      )}


      {/* -- 8. PÓS-LIGAÇÃO --------------------------------------- */}
      {sub === "pos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Header context */}
          <div style={{ padding: "16px 20px", background: "var(--lift)", borderLeft: "2px solid var(--v-border)" }}>
            <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7 }}>
              O que você faz nos primeiros 30 minutos após desligar o telefone determina se haverá uma próxima conversa. Siga o protocolo abaixo em ordem.
            </p>
          </div>

          {/* Protocol steps */}
          {[
            {
              step: "01", title: "Registrar o resultado imediatamente",
              timing: "0–2 min após desligar",
              color: "var(--v)",
              items: [
                "Classificar o resultado: Interesse confirmado / Enviar material / Follow-up agendado / Sem interesse",
                "Registrar objeção principal levantada (para calibrar próxima abordagem)",
                "Anotar o nome exato da pessoa com quem falou e o cargo confirmado",
                topMaker ? `Decisor abordado: ${topMaker.name} — ${topMaker.role}` : "Registrar decisor abordado e perfil percebido",
              ],
              action: "Ferramenta: CRM, planilha ou nota de voz. Não confie na memória.",
            },
            {
              step: "02", title: "E-mail de consolidação (se houve interesse)",
              timing: "Até 2h após a ligação",
              color: "var(--green)",
              items: [
                "Assunto: sem 'obrigado pela atenção' — vá direto ao valor",
                `Estrutura: 1 parágrafo de contexto → 1 dado específico da empresa → próximo passo claro`,
                "Máximo de 5 linhas. Sem anexo na primeira comunicação.",
                topOpp ? `Mencionar: ${topOpp} como ponto de referência da conversa` : "Referenciar o tema específico discutido na ligação",
              ],
              action: "Use o Compositor de E-mail na aba E-mail para gerar a mensagem personalizada.",
            },
            {
              step: "03", title: "WhatsApp de confirmação (se houve avanço)",
              timing: "Mesmo dia — até 4h após",
              color: "var(--yellow)",
              items: [
                "Apenas se houve interesse real ou reunião agendada",
                "Tom: profissional, breve, sem emoji",
                `Estrutura: nome + referência da conversa + próximo passo em 1 linha`,
                "Nunca duplicar o e-mail no WhatsApp — use canal diferente com mensagem diferente",
              ],
              action: "Use os templates da aba WhatsApp para o perfil identificado.",
            },
            {
              step: "04", title: "Protocolo se não houve resposta",
              timing: "D+3 e D+7",
              color: "var(--ink-4)",
              items: [
                "D+3: Follow-up elegante — propor nova possibilidade ou enviar dado complementar",
                "D+7: Última tentativa — retomada com prazo prescricional como contexto",
                "Após D+7 sem resposta: mover para fila fria. Tentar em 90 dias com novo gancho",
                "Nunca enviar 3 mensagens no mesmo canal em menos de 7 dias",
              ],
              action: "Fluxo de follow-up completo disponível na aba WhatsApp.",
            },
          ].map((s, i, arr) => (
            <div key={i} style={{ display: "flex", gap: 20, paddingBottom: 24, borderBottom: i < arr.length - 1 ? "1px solid var(--rule)" : "none" }}>
              <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${s.color}`, background: "transparent" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: s.color }}>{s.step}</span>
                </div>
                {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--rule)", marginTop: 6 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
                  <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.025em" }}>{s.title}</h4>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>{s.timing}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, marginBottom: 14 }}>
                  {s.items.map((item, ii) => (
                    <div key={ii} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: s.color, fontSize: 11, flexShrink: 0, marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>—</span>
                      <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65 }}>{item}</p>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "8px 14px", background: "var(--v-wash)", border: "1px solid var(--v-border)" }}>
                  <p style={{ fontSize: 11, color: "var(--v)", lineHeight: 1.6 }}>→ {s.action}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Summary card */}
          <div style={{ padding: "16px 20px", background: "var(--canvas)", border: "1px solid var(--rule)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", marginBottom: 8 }}>Regra de ouro do pós-ligação</p>
            <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7 }}>
              Um prospect que disse "não" hoje pode dizer "sim" em 90 dias. Um prospect que disse "sim" e não recebeu follow-up adequado nas próximas 2 horas provavelmente esfriará. Velocidade de resposta pós-ligação é o maior diferencial de conversão.
            </p>
          </div>
        </div>
      )}
      {/* -- 7. PERGUNTAS ---------------------------------------- */}
      {sub === "perguntas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7, marginBottom: 20 }}>
            Perguntas inteligentes geram contexto e mostram preparo. Use-as para qualificar, não para pressionar.
          </p>
          {(c.smart_questions ?? []).map((q: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--rule)", alignItems: "flex-start" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--v)", flexShrink: 0, paddingTop: 2, minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
              <p style={{ fontSize: 13, color: "var(--ink-1)", flex: 1, lineHeight: 1.65 }}>{q}</p>
              <CopyBtn text={q} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WaAccordion({ flow }: { flow: { sequence_label: string; messages: Array<{ step: string; when: string; message: string; note: string }> } }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: "var(--r-md)" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" as const }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--ink-4)" }}>{flow.messages[0]?.step ?? ""}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-1)", flex: 1 }}>{flow.sequence_label}</span>
        <span style={{ color: "var(--ink-4)", fontSize: 11, transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>▾</span>
      </button>
      {open && (
        <div style={{ borderTop: "1px solid var(--rule)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {flow.messages.map((msg, i: number) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{msg.when}</span>
                <CopyBtn text={msg.message} />
              </div>
              <pre style={{ fontFamily: "inherit", fontSize: 12, color: "var(--ink-1)", lineHeight: 1.9, whiteSpace: "pre-wrap" as const, margin: 0, marginBottom: 8 }}>{msg.message}</pre>
              <div style={{ padding: "6px 12px", borderLeft: "2px solid var(--rule-mid)" }}>
                <p style={{ fontSize: 10, color: "var(--ink-3)", lineHeight: 1.5, fontStyle: "italic" }}>📌 {msg.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
