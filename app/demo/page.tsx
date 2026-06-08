"use client"
import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"

// ── Demo data — realistic Brazilian company ──────────────────────────────────
const COMPANY = {
  name:    "Metalúrgica Paulista Ltda",
  cnpj:    "12.345.678/0001-90",
  cnae:    "2599-3/99 — Fabricação de produtos de metal",
  regime:  "Lucro Real",
  porte:   "Médio porte",
  cidade:  "Guarulhos / SP",
  socios:  "Ricardo Almeida (Admin), Fernanda Costa (Sócia)",
  fundacao:"2009",
  score:   84,
  tier:    "A",
  timing:  "quente",
  potential: "R$ 2,3M",
  potentialDetail: "Retroativo 5 anos — estimativa preliminar",
}

const PIPELINE_STEPS = [
  { key: "rf",      label: "Receita Federal",        desc: "Consultando dados cadastrais e situação fiscal",   ms: 800  },
  { key: "enrich",  label: "Enriquecimento web",     desc: "Mapeando presença digital e sinais de mercado",    ms: 1400 },
  { key: "pessoas", label: "Mapeamento de decisores",desc: "Identificando CFO, diretores e contadores",        ms: 2200 },
  { key: "legal",   label: "Pesquisa jurídica",      desc: "Cruzando base de processos e execuções fiscais",   ms: 3200 },
  { key: "timing",  label: "Análise de timing",      desc: "Avaliando temperatura e momento da abordagem",     ms: 4000 },
  { key: "engine",  label: "Motor tributário",       desc: "Calculando teses aplicáveis e potencial retroativo",ms: 4800 },
  { key: "score",   label: "Scoring estratégico",    desc: "Consolidando dossiê e calibrando score",           ms: 5600 },
]

const OPORTUNIDADES = [
  { name: "PIS/COFINS — Insumos industriais",   pot: "R$ 980k", score: 92, risco: "Baixo",  tese: "REsp 1.221.170/PR — STJ" },
  { name: "ICMS-ST — Ressarcimento",            pot: "R$ 740k", score: 87, risco: "Baixo",  tese: "ADC 49 — STF" },
  { name: "IPI — Créditos não aproveitados",    pot: "R$ 380k", score: 74, risco: "Médio",  tese: "IN RFB 2.121/2023" },
  { name: "CSLL — Base de cálculo",             pot: "R$ 220k", score: 61, risco: "Médio",  tese: "RE 835.818 — STF" },
]

const DECISORES = [
  { name: "Ricardo Almeida",  role: "Diretor Administrativo",  perfil: "Financeiro", abertura: 88, fonte: "RF+LI" },
  { name: "Fernanda Costa",   role: "Sócia-Diretora",          perfil: "Fiscal",     abertura: 72, fonte: "RF"    },
  { name: "Marcos Oliveira",  role: "Contador (terceirizado)",  perfil: "Contador",   abertura: 65, fonte: "LI"    },
]

const HISTORICO = [
  { tipo: "Auto de Infração",    num: "16327.720041/2021-98", valor: "R$ 340k", status: "Em discussão administrativa", risco: "alto"   },
  { tipo: "Mandado de Segurança",num: "5042891-22.2022.4.03", valor: "—",       status: "Deferido — liminar ativa",    risco: "baixo"  },
  { tipo: "Parcelamento REFIS",  num: "Portaria PGFN 2023",   valor: "R$ 180k", status: "Em dia",                      risco: "neutro" },
]

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = "idle" | "typing" | "pipeline" | "result"
type Tab   = "contexto" | "oportunidades" | "decisores" | "historico" | "playbook"

export default function DemoPage() {
  const [phase,      setPhase]      = useState<Phase>("idle")
  const [typed,      setTyped]      = useState("")
  const [pipeIdx,    setPipeIdx]    = useState(-1)
  const [activeTab,  setActiveTab]  = useState<Tab>("contexto")
  const [elapsed,    setElapsed]    = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cnpj = "12.345.678/0001-90"

  function startDemo() {
    if (phase !== "idle") { resetDemo(); return }
    setPhase("typing")
    setTyped("")
    setPipeIdx(-1)
    setActiveTab("contexto")
    setElapsed(0)

    // Type the CNPJ
    let i = 0
    const typeInterval = setInterval(() => {
      setTyped(cnpj.slice(0, i + 1))
      i++
      if (i >= cnpj.length) {
        clearInterval(typeInterval)
        setTimeout(() => runPipeline(), 500)
      }
    }, 60)
  }

  function runPipeline() {
    setPhase("pipeline")
    const start = Date.now()
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 100) / 10)
    }, 100)

    PIPELINE_STEPS.forEach((s, idx) => {
      setTimeout(() => {
        setPipeIdx(idx)
        if (idx === PIPELINE_STEPS.length - 1) {
          setTimeout(() => {
            if (timerRef.current) clearInterval(timerRef.current)
            setPhase("result")
          }, 800)
        }
      }, s.ms)
    })
  }

  function resetDemo() {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase("idle")
    setTyped("")
    setPipeIdx(-1)
    setElapsed(0)
  }

  // Auto-start after 1.5s
  useEffect(() => {
    const t = setTimeout(startDemo, 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", fontFamily: "'Inter',-apple-system,sans-serif", color: "var(--ink-1)" }}>

      {/* ── TOP BAR ───────────────────────────────────────── */}
      <div style={{ height: 52, background: "var(--side-bg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 18, height: 18, background: "var(--v)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, color: "var(--lift)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>AXIOM</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--ink-2)", marginLeft: 8, letterSpacing: "0.08em" }}>DEMO INTERATIVA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>Veja o produto em ação</span>
          <Link href="/cadastro" style={{ padding: "6px 16px", background: "var(--v)", color: "#fff", fontSize: 11, fontWeight: 600, textDecoration: "none", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.01em" }}>
            Criar conta →
          </Link>
        </div>
      </div>

      {/* ── DEMO SHELL ────────────────────────────────────── */}
      <div style={{ display: "flex", height: "calc(100vh - 52px)" }}>

        {/* Sidebar */}
        <div style={{ width: 240, background: "var(--side-bg)", display: "flex", flexDirection: "column" as const, padding: "20px 0", flexShrink: 0 }}>
          {/* Search field */}
          <div style={{ padding: "0 16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--side-text-3)", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 8 }}>Identificador fiscal</p>
            <div style={{ background: "var(--side-surface)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: phase === "idle" ? "var(--ink-2)" : "var(--lift)", letterSpacing: "0.04em", flex: 1, minHeight: 18 }}>
                {typed || (phase === "idle" ? "00.000.000/0001-00" : "")}
                {phase === "typing" && <span style={{ animation: "blink 1s infinite", color: "var(--v)" }}>|</span>}
              </span>
            </div>
            <button
              onClick={startDemo}
              style={{ width: "100%", marginTop: 8, padding: "8px 0", background: phase === "result" ? "rgba(79,70,229,0.2)" : "var(--v)", color: phase === "result" ? "var(--v)" : "#fff", border: "none", fontSize: 11, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", cursor: "pointer", transition: "all 150ms" }}>
              {phase === "idle" ? "▶ Iniciar demo" : phase === "result" ? "↺ Nova análise" : "Analisando..."}
            </button>
          </div>

          {/* Sidebar fields */}
          {["Metalúrgica Paulista", "2599-3/99 — Metal", "Lucro Real", ""].map((v, i) => (
            <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--ink-2)", letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 4 }}>
                {["Empresa", "Segmento", "Regime fiscal", ""][i]}
              </p>
              <p style={{ fontSize: 11, color: v ? "var(--side-text-2)" : "#0F172A" }}>{v || "—"}</p>
            </div>
          ))}

          {/* Score */}
          {phase === "result" && (
            <div style={{ padding: "14px 16px", marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--side-text-3)", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 10 }}>Rating estratégico</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.04em" }}>A</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, color: "var(--side-text-2)" }}>84</span>
              </div>
              <div style={{ height: 1, background: "var(--side-border)" }}>
                <div style={{ height: "100%", width: "84%", background: "var(--green)", transition: "width 1s var(--ease)" }} />
              </div>
            </div>
          )}
        </div>

        {/* Main canvas */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden" }}>

          {/* Phase: idle */}
          {phase === "idle" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "40px" }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--ink-5)", letterSpacing: "0.2em", textTransform: "uppercase" as const, marginBottom: 32 }}>
                AXIOM / Estação de inteligência
              </p>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16, textAlign: "center" as const }}>
                Inteligência tributária completa<br />em menos de 60 segundos.
              </h2>
              <p style={{ fontSize: 13, color: "var(--ink-4)", marginBottom: 32, textAlign: "center" as const }}>
                Clique em "Iniciar demo" para ver uma análise real sendo gerada ao vivo.
              </p>
              <button onClick={startDemo} style={{ padding: "12px 32px", background: "var(--v)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", cursor: "pointer" }}>
                ▶ Iniciar demo interativa
              </button>
            </div>
          )}

          {/* Phase: typing / pipeline */}
          {(phase === "typing" || phase === "pipeline") && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, justifyContent: "center", padding: "0 72px", maxWidth: 640 }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.2em", textTransform: "uppercase" as const, marginBottom: 32 }}>
                {phase === "typing" ? "Identificando empresa..." : "Pipeline em execução"}
              </p>
              {phase === "typing" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, background: "var(--v)", borderRadius: "50%", animation: "pulse 1s infinite" }} />
                  <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Consultando Receita Federal...</p>
                </div>
              )}
              {phase === "pipeline" && PIPELINE_STEPS.map((s, idx) => {
                const done   = idx <= pipeIdx
                const active = idx === pipeIdx
                return (
                  <div key={s.key} style={{ display: "flex", gap: 20, paddingBottom: 18, opacity: done ? 1 : 0.2, transition: "opacity 400ms" }}>
                    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: done ? (active ? "var(--v)" : "var(--green)") : "var(--recess)", transition: "background 300ms", boxShadow: active ? "0 0 8px rgba(79,70,229,0.5)" : "none" }} />
                      {idx < PIPELINE_STEPS.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--recess)", marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingBottom: 4 }}>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: active ? "var(--ink-1)" : done ? "var(--ink-3)" : "var(--ink-5)", marginBottom: 2 }}>
                        {s.label}
                        {done && !active && <span style={{ marginLeft: 8, color: "var(--green)", fontSize: 9 }}>✓</span>}
                        {active && <span style={{ marginLeft: 8, color: "var(--v)", fontSize: 9 }}>em curso</span>}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--ink-5)" }}>{s.desc}</p>
                    </div>
                  </div>
                )
              })}
              {phase === "pipeline" && (
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--ink-5)", marginTop: 8 }}>
                  {elapsed.toFixed(1)}s
                </p>
              )}
            </div>
          )}

          {/* Phase: result */}
          {phase === "result" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden" }}>

              {/* Intelligence Brief */}
              <div style={{ flexShrink: 0, borderBottom: "1px solid rgba(12,18,34,0.1)", background: "#fff", padding: "20px 48px 0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--ink-5)", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 6 }}>Intelligence Brief</p>
                    <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.04em" }}>{COMPANY.name}</h1>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--red)" }} />
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Timing quente</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--ink-5)" }}>94% conf. · RF · LI · JB · WEB</span>
                  </div>
                </div>

                {/* 5 metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0 24px", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(12,18,34,0.08)" }}>
                  {[
                    { l: "Potencial retroativo", v: COMPANY.potential, hi: true  },
                    { l: "Decisores mapeados",   v: "3 identificados",  hi: false },
                    { l: "Processos ativos",     v: "3 encontrados",    hi: false },
                    { l: "Rating estratégico",   v: "A · Alto",         hi: true  },
                    { l: "Exposição fiscal",     v: "Moderada",         hi: false },
                  ].map(({ l, v, hi }) => (
                    <div key={l}>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--ink-5)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 5 }}>{l}</p>
                      <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: hi ? "var(--ink-1)" : "var(--ink-3)", letterSpacing: "-0.02em" }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* Action Engine */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--v)", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 6 }}>→ Ação recomendada</p>
                    <p style={{ fontSize: 12, color: "var(--ink-1)", lineHeight: 1.65 }}>Abordar Ricardo Almeida com a tese PIS/COFINS sobre insumos industriais. Empresa em expansão — timing ideal para proposta de revisão retroativa.</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--ink-4)", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 6 }}>Gancho principal</p>
                    <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.65 }}>PIS/COFINS — Insumos industriais (REsp 1.221.170/PR)
                      <span style={{ display: "block", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--ink-5)", marginTop: 3 }}>Abordar: Ricardo Almeida · Dir. Administrativo</span>
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 0, marginTop: 4 }}>
                  {(["contexto","oportunidades","decisores","historico","playbook"] as Tab[]).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "8px 16px 10px", border: "none", borderBottom: `2px solid ${activeTab === t ? "var(--v)" : "transparent"}`, background: "none", cursor: "pointer", fontSize: 11, fontWeight: activeTab === t ? 600 : 400, color: activeTab === t ? "var(--ink-1)" : "var(--ink-4)", transition: "all 120ms", textTransform: "capitalize" as const, letterSpacing: "-0.01em" }}>
                      {t === "historico" ? "Jur. Tributário" : t === "playbook" ? "Operações" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "28px 48px" }}>

                {/* CONTEXTO */}
                {activeTab === "contexto" && (
                  <div style={{ maxWidth: 700 }}>
                    <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.85, marginBottom: 28 }}>
                      Metalúrgica Paulista é uma empresa de médio porte no segmento de fabricação de produtos metálicos, com operação consolidada em Guarulhos/SP desde 2009. Opera sob Lucro Real com faturamento estimado entre R$15M e R$40M anuais. Identificamos expansão recente de capacidade produtiva e contratação acelerada — sinais de momento favorável para abordagem.
                    </p>
                    {[
                      { l: "CNPJ",           v: COMPANY.cnpj,    src: "RF" },
                      { l: "CNAE principal", v: COMPANY.cnae,    src: "RF" },
                      { l: "Regime fiscal",  v: COMPANY.regime,  src: "RF" },
                      { l: "Porte",          v: COMPANY.porte,   src: "AX" },
                      { l: "Sede",           v: COMPANY.cidade,  src: "RF" },
                      { l: "Fundação",       v: COMPANY.fundacao,src: "RF" },
                      { l: "Quadro societário", v: COMPANY.socios, src: "RF" },
                    ].map(({ l, v, src }) => (
                      <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "9px 0", borderBottom: "1px solid rgba(12,18,34,0.08)" }}>
                        <span style={{ fontSize: 12, color: "var(--ink-4)", flexShrink: 0, width: 160 }}>{l}</span>
                        <span style={{ flex: 1, fontSize: 13, color: "var(--ink-1)" }}>{v}</span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--ink-5)", letterSpacing: "0.1em", padding: "1px 5px", border: "1px solid rgba(12,18,34,0.1)", flexShrink: 0 }}>{src}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* OPORTUNIDADES */}
                {activeTab === "oportunidades" && (
                  <div style={{ maxWidth: 800 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid rgba(12,18,34,0.08)" }}>
                      <div>
                        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--ink-5)", letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 6 }}>Potencial retroativo estimado</p>
                        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.04em" }}>{COMPANY.potential}</p>
                        <p style={{ fontSize: 11, color: "var(--ink-5)", marginTop: 3 }}>{COMPANY.potentialDetail}</p>
                      </div>
                    </div>
                    {OPORTUNIDADES.map((o, i) => (
                      <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid rgba(12,18,34,0.08)", display: "flex", alignItems: "center", gap: 20 }}>
                        <div style={{ width: 36, height: 36, background: "var(--green-wash)", border: "1px solid rgba(5,150,105,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--green)", fontWeight: 600 }}>{o.score}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.01em", marginBottom: 3 }}>{o.name}</p>
                          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--ink-5)", letterSpacing: "0.04em" }}>{o.tese}</p>
                        </div>
                        <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: "var(--green)", letterSpacing: "-0.02em" }}>{o.pot}</p>
                          <p style={{ fontSize: 10, color: o.risco === "Baixo" ? "var(--green)" : "var(--yellow)", marginTop: 2 }}>Risco {o.risco}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DECISORES */}
                {activeTab === "decisores" && (
                  <div style={{ maxWidth: 700 }}>
                    <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7, marginBottom: 24 }}>
                      {DECISORES.length} decisores mapeados. Score de abertura calculado com base no perfil da empresa e histórico fiscal.
                    </p>
                    {DECISORES.map((d, i) => (
                      <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid rgba(12,18,34,0.08)", display: "flex", alignItems: "center", gap: 20 }}>
                        <div style={{ width: 36, height: 36, background: i === 0 ? "rgba(79,70,229,0.08)" : "rgba(12,18,34,0.04)", border: `1px solid ${i === 0 ? "var(--v-border)" : "var(--rule)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: i === 0 ? "var(--v)" : "var(--ink-4)" }}>{String(i+1).padStart(2,"0")}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>{d.name}</p>
                            {i === 0 && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--v)", border: "1px solid rgba(79,70,229,0.3)", padding: "1px 6px", letterSpacing: "0.08em" }}>RECOMENDAR</span>}
                          </div>
                          <p style={{ fontSize: 12, color: "var(--ink-4)" }}>{d.role} · Perfil {d.perfil}</p>
                        </div>
                        <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600, color: d.abertura >= 80 ? "var(--green)" : d.abertura >= 65 ? "var(--yellow)" : "var(--ink-4)" }}>{d.abertura}%</p>
                          <p style={{ fontSize: 10, color: "var(--ink-5)" }}>abertura estimada</p>
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--ink-5)", padding: "1px 5px", border: "1px solid rgba(12,18,34,0.08)" }}>{d.fonte}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* HISTÓRICO */}
                {activeTab === "historico" && (
                  <div style={{ maxWidth: 700 }}>
                    <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7, marginBottom: 24 }}>
                      Maturidade jurídica: <strong>Moderada</strong>. Empresa com histórico de discussões administrativas ativas — perfil receptivo a revisão tributária especializada.
                    </p>
                    {HISTORICO.map((h, i) => (
                      <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid rgba(12,18,34,0.08)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: h.risco === "alto" ? "var(--red)" : h.risco === "baixo" ? "var(--green)" : "var(--ink-5)", flexShrink: 0, marginTop: 5 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", marginBottom: 3 }}>{h.tipo}</p>
                          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--ink-5)", marginBottom: 4 }}>{h.num}</p>
                          <p style={{ fontSize: 12, color: "var(--ink-3)" }}>{h.status}</p>
                        </div>
                        {h.valor !== "—" && (
                          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: "var(--red)", flexShrink: 0 }}>{h.valor}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* PLAYBOOK */}
                {activeTab === "playbook" && (
                  <div style={{ maxWidth: 640 }}>
                    <div style={{ padding: "18px 22px", background: "var(--v-wash)", border: "1px solid rgba(79,70,229,0.15)", marginBottom: 24 }}>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--v)", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 10 }}>→ Ação recomendada</p>
                      <p style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.7, marginBottom: 12 }}>
                        Abordar <strong>Ricardo Almeida</strong> (Diretor Administrativo) com foco na tese PIS/COFINS sobre insumos industriais. Usar o momento de expansão da empresa como janela de timing.
                      </p>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--ink-4)" }}>Perfil recomendado: Financeiro · Score de abertura 88%</p>
                    </div>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--ink-5)", letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 14 }}>Abertura sugerida para Ricardo Almeida</p>
                    <div style={{ padding: "16px 20px", background: "var(--canvas)", border: "1px solid rgba(12,18,34,0.08)", marginBottom: 20 }}>
                      <p style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.8, fontStyle: "italic" }}>
                        "Algumas empresas do segmento de vocês estão revisando a eficiência tributária sobre insumos — principalmente com base em decisões recentes do STJ que alteraram o entendimento sobre PIS/COFINS. Com base no perfil operacional de vocês, identificamos pontos que podem ser relevantes. Quando tiver 20 minutos, posso apresentar uma estimativa preliminar?"
                      </p>
                    </div>
                    <div style={{ padding: "12px 16px", borderLeft: "2px solid #DC2626", background: "var(--red-wash)", marginBottom: 12 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: "var(--red)", marginBottom: 4 }}>NUNCA DIZER</p>
                      <p style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic" }}>"Identificamos R$ 2,3M de oportunidade para vocês"</p>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--ink-5)", marginTop: 16 }}>
                      Playbook completo disponível para usuários cadastrados — Por Perfil, Condução, WhatsApp, Objeções e Pós-Ligação.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CTA FOOTER ────────────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--side-bg)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 50 }}>
        <div>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: "var(--lift)", letterSpacing: "-0.02em" }}>
            Pronto para usar o AXIOM com seus prospects reais?
          </p>
          <p style={{ fontSize: 11, color: "var(--side-text-3)", marginTop: 2 }}>
            Acesso completo a partir de R$ 97/mês · Sem fidelidade
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/login" style={{ fontSize: 12, color: "var(--ink-3)", textDecoration: "none" }}>Já tenho conta</Link>
          <Link href="/cadastro" style={{ padding: "10px 28px", background: "var(--v)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.01em", transition: "all 150ms" }}>
            Criar minha conta →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(12,18,34,0.12); }
      `}</style>
    </div>
  )
}
