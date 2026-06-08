// ================================================================
// AXIOM -- Legal Intelligence Engine v4
//
// ARCHITECTURE: 5-layer hybrid legal research pipeline
//
// Layer 1: Primary search by CNPJ + razao social + socios
// Layer 2: TRF-directed search (auto-maps UF -> TRF)
// Layer 3: Diario Oficial mentions
// Layer 4: Tax intelligence (classify teses, conflicts, approach)
// Layer 5: Confidence scoring per finding
//
// RULE: Never say "nenhum processo encontrado".
//       Absence of evidence != evidence of absence.
//       Always honest about search depth.
// ================================================================

export type LegalMaturityLevel = "none" | "low" | "medium" | "high"

export type LegalActionType =
  | "mandado_seguranca"
  | "acao_ordinaria"
  | "compensacao"
  | "execucao_fiscal"
  | "recurso"
  | "tese_tributaria"
  | "per_dcomp"
  | "impugnacao"
  | "tutela"
  | "embargos"
  | "indefinido"

export interface LegalFinding {
  type:              LegalActionType
  theme:             string
  subject_matter:    string
  description:       string
  process_number?:   string
  court:             string
  trf_ref:           string
  filing_year?:      string
  status:            "ativo" | "encerrado" | "desconhecido"
  days_ago?:         number
  // Lawyer intelligence
  lawyer_name?:      string
  lawyer_oab?:       string
  law_firm?:         string
  // Evidence chain
  source:            string
  source_url?:       string
  evidence:          string
  confidence:        "high" | "medium" | "low"
  source_count:      number
  // Commercial intelligence
  commercial_signal:    string
  commercial_relevance: "alta" | "media" | "baixa"
  approach_impact:      string  // what this means for the call
  conflict_warning?:    string  // if this tese is already litigated
  stj_ref:              string
  found_at:             string
}

export interface LegalIntelligence {
  company_name:       string
  cnpj:               string
  trf_competente:     string
  trf_url:            string
  maturity_level:     LegalMaturityLevel
  maturity_label:     string
  litigation_profile: string
  approach_shift:     string
  // Commercial impact block
  commercial_impact:  {
    headline:         string
    bullets:          string[]
    recommended_angle: string
    avoid:            string[]
  }
  findings:           LegalFinding[]
  law_firms:          Array<{ name: string; specialty: string; lawyers: string[] }>
  copilot_signals:    string[]
  // Search transparency
  sources_searched:   string[]
  search_layers:      string[]
  search_confidence:  "deep" | "moderate" | "shallow"
  confidence_note:    string
  caveat:             string
  searched_at:        string
}

// ----------------------------------------------------------------
// TRF mapping -- complete Brazil coverage
// ----------------------------------------------------------------

const TRF_MAP: Record<string, { trf: string; full: string; url: string }> = {
  // TRF1 - Brasilia (largest region)
  AM: { trf: "TRF1", full: "Tribunal Regional Federal da 1a Regiao", url: "https://www.trf1.jus.br" },
  AC: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  RR: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  AP: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  PA: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  MA: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  PI: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  TO: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  GO: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  DF: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  BA: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  MT: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  MG: { trf: "TRF6", full: "Tribunal Regional Federal da 6a Regiao", url: "https://www.trf6.jus.br" },
  RO: { trf: "TRF1", full: "TRF1", url: "https://www.trf1.jus.br" },
  // TRF2 - Rio de Janeiro
  RJ: { trf: "TRF2", full: "Tribunal Regional Federal da 2a Regiao", url: "https://www.trf2.jus.br" },
  ES: { trf: "TRF2", full: "TRF2", url: "https://www.trf2.jus.br" },
  // TRF3 - Sao Paulo (most relevant for business)
  SP: { trf: "TRF3", full: "Tribunal Regional Federal da 3a Regiao", url: "https://www.trf3.jus.br" },
  MS: { trf: "TRF3", full: "TRF3", url: "https://www.trf3.jus.br" },
  // TRF4 - Sul
  RS: { trf: "TRF4", full: "Tribunal Regional Federal da 4a Regiao", url: "https://www.trf4.jus.br" },
  SC: { trf: "TRF4", full: "TRF4", url: "https://www.trf4.jus.br" },
  PR: { trf: "TRF4", full: "TRF4", url: "https://www.trf4.jus.br" },
  // TRF5 - Nordeste
  PE: { trf: "TRF5", full: "TRF5", url: "https://www.trf5.jus.br" },
  CE: { trf: "TRF5", full: "TRF5", url: "https://www.trf5.jus.br" },
  AL: { trf: "TRF5", full: "TRF5", url: "https://www.trf5.jus.br" },
  RN: { trf: "TRF5", full: "TRF5", url: "https://www.trf5.jus.br" },
  PB: { trf: "TRF5", full: "TRF5", url: "https://www.trf5.jus.br" },
  SE: { trf: "TRF5", full: "TRF5", url: "https://www.trf5.jus.br" },
}

function getTRFData(uf: string): { trf: string; full: string; url: string } {
  return TRF_MAP[uf?.toUpperCase()] ?? { trf: "TRF (regiao a confirmar)", full: "TRF (regiao a confirmar)", url: "https://www.cnj.jus.br" }
}

// ----------------------------------------------------------------
// Process number extraction (CNJ format)
// ----------------------------------------------------------------

function extractProcessNumber(text: string): string | null {
  const cnj = text.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/)
  if (cnj) return cnj[0]
  const old = text.match(/\d{4}\.\d{2}\.\d{2}\.\d{6}/)
  if (old) return old[0]
  return null
}

function extractYear(text: string): string | null {
  const m = text.match(/\b(20(?:1[5-9]|2[0-5]))\b/)
  return m?.[1] ?? null
}

function extractDaysAgo(text: string): number | undefined {
  const d = text.match(/(\d+)\s*dias?\s*atr[aá]s/i)
  if (d) return parseInt(d[1])
  const h = text.match(/(\d+)\s*horas?\s*atr[aá]s/i)
  if (h) return 0
  return undefined
}

// ----------------------------------------------------------------
// Subject matter classification -- 20+ patterns
// ----------------------------------------------------------------

const SUBJECT_PATTERNS: Array<{
  pattern: RegExp
  subject:  string
  stj_ref:  string
  type:     LegalActionType
  priority: number
  tese_slug: string
}> = [
  { pattern: /exclus[aã]o\s+(?:do\s+)?icms.*(?:pis|cofins)|icms.*base.*pis.*cofins/i, subject: "Exclusao ICMS da base PIS/COFINS", stj_ref: "STF Tema 69 / RE 574.706", type: "mandado_seguranca", priority: 10, tese_slug: "exclusao_icms_pis_cofins" },
  { pattern: /sistema\s+s\b/i, subject: "Sistema S -- limitacao base de calculo", stj_ref: "STJ Tema 1.079", type: "mandado_seguranca", priority: 9, tese_slug: "sistema_s" },
  { pattern: /icms[-\s]?st.*(?:pis|cofins)|(?:pis|cofins).*icms[-\s]?st/i, subject: "ICMS-ST na base PIS/COFINS", stj_ref: "STJ Tema 1.125", type: "tese_tributaria", priority: 9, tese_slug: "icms_st_pis_cofins" },
  { pattern: /insumo.*(?:pis|cofins)|(?:pis|cofins).*insumo|revis[aã]o.*insumo/i, subject: "Creditamento PIS/COFINS -- conceito de insumo", stj_ref: "STJ REsp 1.221.170", type: "mandado_seguranca", priority: 8, tese_slug: "insumos_pis_cofins" },
  { pattern: /taxa\s+(?:de\s+)?cart[aã]o|mdr.*(?:pis|cofins)|(?:pis|cofins).*mdr/i, subject: "Taxa de cartao na base PIS/COFINS", stj_ref: "STJ Temas 779/780", type: "tese_tributaria", priority: 8, tese_slug: "taxa_cartao_pis_cofins" },
  { pattern: /verba.*indenizat|indenizat.*(?:inss|previdencia)/i, subject: "Verbas indenizatorias na base INSS", stj_ref: "STJ Tema 20", type: "mandado_seguranca", priority: 8, tese_slug: "verbas_indenizatorias" },
  { pattern: /difal.*(?:inconstitucional|adi|partilha)|(?:adi|inconstitucional).*difal/i, subject: "DIFAL -- inconstitucionalidade", stj_ref: "STF ADI 5.469", type: "mandado_seguranca", priority: 7, tese_slug: "difal" },
  { pattern: /ipi.*exporta[cç][aã]o|cr[eé]dito.*presumido.*ipi/i, subject: "IPI -- credito presumido exportacao", stj_ref: "Lei 9.363/96", type: "mandado_seguranca", priority: 7, tese_slug: "ipi_exportacao" },
  { pattern: /pis.*cofins.*folha|folha.*(?:pis|cofins)/i, subject: "PIS/COFINS sobre folha de salarios", stj_ref: "STF RE 569.441", type: "mandado_seguranca", priority: 7, tese_slug: "pis_cofins_folha" },
  { pattern: /icms\s+grossup|grossup.*icms/i, subject: "ICMS -- grossup base de calculo", stj_ref: "STF Tema 1.182", type: "tese_tributaria", priority: 7, tese_slug: "icms_grossup" },
  { pattern: /bonificac[aã]o|desconto.*(?:pis|cofins)|(?:pis|cofins).*desconto/i, subject: "Bonificacoes e descontos -- base PIS/COFINS", stj_ref: "STJ REsp 1.354.041", type: "tese_tributaria", priority: 6, tese_slug: "bonificacoes" },
  { pattern: /execu[cç][aã]o\s+fiscal/i, subject: "Execucao fiscal", stj_ref: "", type: "execucao_fiscal", priority: 5, tese_slug: "execucao_fiscal" },
  { pattern: /compensac[aã]o.*tributar/i, subject: "Compensacao tributaria", stj_ref: "", type: "compensacao", priority: 6, tese_slug: "compensacao" },
  { pattern: /per.?dcomp/i, subject: "PER/DCOMP -- pedido de compensacao", stj_ref: "", type: "per_dcomp", priority: 5, tese_slug: "per_dcomp" },
  { pattern: /tutela.*tributar|tutela.*fiscal/i, subject: "Tutela tributaria", stj_ref: "", type: "tutela", priority: 6, tese_slug: "tutela" },
  { pattern: /embargos.*execu[cç][aã]o|embargos.*fiscal/i, subject: "Embargos a execucao fiscal", stj_ref: "", type: "embargos", priority: 5, tese_slug: "embargos" },
  { pattern: /mandado\s+de\s+seguran[cç]a.*tributar/i, subject: "Mandado de seguranca tributario", stj_ref: "", type: "mandado_seguranca", priority: 4, tese_slug: "ms_generico" },
]

function classifySubject(text: string): {
  subject: string; stj_ref: string; type: LegalActionType; priority: number; tese_slug: string
} {
  const lc = text.toLowerCase()
  // Try patterns in priority order
  const sorted = [...SUBJECT_PATTERNS].sort((a, b) => b.priority - a.priority)
  for (const p of sorted) {
    if (p.pattern.test(lc)) return p
  }
  return { subject: "Discussao tributaria identificada", stj_ref: "", type: "indefinido", priority: 1, tese_slug: "indefinido" }
}

// ----------------------------------------------------------------
// Lawyer / firm extraction
// ----------------------------------------------------------------

function extractLawyer(text: string): { name?: string; oab?: string; firm?: string } {
  const oabMatch = text.match(/OAB[^0-9]*([A-Z]{2})\s*[\\/]?\s*(\d{4,7})/i)
  const firmPatterns = [
    /(?:escritorio|adv(?:ogados)?\.?|advocacia|associados|sociedade\s+de\s+adv)[:\s]+([A-Z][a-zA-Z\s&]+?)(?:\.|,|$)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s+(?:Advogados?|Advocacia)/i,
  ]
  const namePatterns = [
    /(?:adv\.|advogado|advogada|dr\.|dra\.)[:\s]+([A-ZÁÉÍÓÚ][a-záéíóúàâêôãõç]+(?: [A-ZÁÉÍÓÚ][a-záéíóúàâêôãõç]+)+)/i,
    /(?:patrono|causídico)[:\s]+([A-ZÁÉÍÓÚ][a-záéíóúàâêôãõç]+(?: [A-ZÁÉÍÓÚ][a-záéíóúàâêôãõç]+)+)/i,
  ]
  let firm: string | undefined
  for (const p of firmPatterns) {
    const m = text.match(p)
    if (m) { firm = m[1]?.trim(); break }
  }
  let name: string | undefined
  for (const p of namePatterns) {
    const m = text.match(p)
    if (m) { name = m[1]?.trim(); break }
  }
  return {
    name,
    oab: oabMatch ? `OAB/${oabMatch[1]} ${oabMatch[2]}` : undefined,
    firm,
  }
}

// ----------------------------------------------------------------
// Google News search helper
// ----------------------------------------------------------------

async function searchGoogleNews(
  query: string,
  maxItems = 6
): Promise<Array<{ title: string; desc: string; link: string }>> {
  try {
    const q = encodeURIComponent(query)
    const url = `https://news.google.com/rss/search?q=${q}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
    const res = await fetch(url, { signal: AbortSignal.timeout(5_000) })
    if (!res.ok) return []
    const xml = await res.text()
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, maxItems).map(m => ({
      title: (m[1].match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").replace(/<!?\[CDATA\[|\]\]>/g, "").trim(),
      desc:  (m[1].match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "").replace(/<!?\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, " ").trim(),
      link:  (m[1].match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "").trim(),
    })).filter(r => r.title.length > 5)
  } catch { return [] }
}

// ----------------------------------------------------------------
// Company word extraction
// ----------------------------------------------------------------

const GENERIC_WORDS = new Set([
  "SUPERMERCADO","SUPERMERCADOS","TRANSPORTE","TRANSPORTES","FARMACIA","FARMACIAS",
  "CONSTRUTORA","CONSTRUTORAS","HOSPITAL","HOSPITAIS","TECNOLOGIA","CLINICA","CLINICAS",
  "COMERCIAL","DISTRIBUIDORA","DISTRIBUIDORES","HOLDING","INVESTIMENTOS","PARTICIPACOES",
  "SOLUCOES","SOLUCAO","SERVICOS","SERVICO","INDUSTRIAS","INDUSTRIA","SISTEMAS","SISTEMA",
  "INFORMATICA","CONSULTORIA","ASSESSORIA","ENGENHARIA","CONSTRUCAO","EMPREENDIMENTOS",
  "INCORPORADORA","LOGISTICA","ALIMENTOS","VEICULOS","SAUDE","EDUCACAO","ESCOLA",
  "AGROPECUARIA","AGRO","COMERCIO","COMERCIOS","LTDA","SA","ME","EPP","EIRELI",
  "E","DE","DO","DA","DOS","DAS","EM","COM","PARA","POR","OU",
])

function extractCompanyWord(razao_social: string, nome_fantasia?: string | null): string {
  const source = (nome_fantasia && nome_fantasia.trim().length > 2)
    ? nome_fantasia.trim().toUpperCase()
    : razao_social.toUpperCase()
  const parts = source.split(/\s+/)
  for (const p of parts) {
    const clean = p.replace(/[.,;:]/g, "")
    if (clean.length >= 3 && !GENERIC_WORDS.has(clean)) return clean
  }
  return parts[0] ?? razao_social.slice(0, 6).toUpperCase()
}

// ----------------------------------------------------------------
// Input interface
// ----------------------------------------------------------------

export interface LegalResearchInput {
  cnpj:          string
  razao_social:  string
  uf:            string
  nome_fantasia?: string | null
  manual_text?:  string
  qsa_names?:    string[]
}

// ----------------------------------------------------------------
// MAIN ENGINE - 5 layers
// ----------------------------------------------------------------

export async function researchLegalIntelligence(
  input: LegalResearchInput
): Promise<LegalIntelligence> {
  try {

  const { cnpj, razao_social, uf } = input
  const trfData    = getTRFData(uf ?? "SP")
  const trf        = trfData.trf
  const now        = new Date().toISOString()
  const findings:  LegalFinding[]  = []
  const sourcesSearched: string[]  = []
  const layersRun:  string[]       = []
  const lawFirmMap: Map<string, { specialty: string; lawyers: string[] }> = new Map()

  const companyShort = razao_social.split(" ").slice(0, 4).join(" ")
  const word1        = extractCompanyWord(razao_social, input.nome_fantasia)
  const cnpjClean    = cnpj.replace(/\D/g, "").slice(0, 8)
  const cnpjFull     = cnpj.replace(/\D/g, "")

  // -- LAYER 1: Primary search (CNPJ + razao social variants) -----
  layersRun.push("Camada 1: Busca primaria por CNPJ e razao social")
  const layer1Queries = [
    `"${companyShort}" mandado seguranca tributario`,
    `"${companyShort}" acao tributaria jusbrasil OR escavador`,
    `"${cnpjClean}" processo tributario OR execucao fiscal`,
    `"${cnpjClean}" mandado seguranca OR compensacao tributaria`,
    `"${word1}" tributario mandado OR execucao site:jusbrasil.com.br`,
    `"${word1}" processo tributario site:escavador.com`,
  ]

  // -- LAYER 2: TRF-directed search -------------------------------
  layersRun.push(`Camada 2: Busca direcionada ${trf} (${uf})`)
  const layer2Queries = [
    `"${word1}" ${trf} mandado seguranca tributario`,
    `"${companyShort}" ${trf} pis cofins OR icms OR inss`,
    `"${cnpjClean}" ${trf}`,
    `"${word1}" execucao fiscal ${trf} OR fazenda federal`,
    `"${word1}" juizado especial federal tributario ${uf}`,
  ]

  // -- LAYER 3: Diario Oficial + PGFN -----------------------------
  layersRun.push("Camada 3: Diario Oficial e PGFN")
  const layer3Queries = [
    `site:pgfn.fazenda.gov.br "${cnpjClean}"`,
    `"${cnpjFull}" diario oficial tributario OR fiscal`,
    `"${companyShort}" diario oficial uniao tributario`,
    `"${word1}" despacho tributario OR decisao fiscal "diario oficial"`,
  ]

  // -- LAYER 4: Escavador + JusBrasil deep ------------------------
  layersRun.push("Camada 4: Escavador e JusBrasil aprofundado")
  const layer4Queries = [
    `site:jusbrasil.com.br "${word1}" pis cofins OR icms OR sistema s`,
    `site:escavador.com "${word1}" processo tributario`,
    `"${companyShort}" exclusao icms pis cofins OR "sistema s" OR "icms-st"`,
    `"${word1}" embargos execucao fiscal OR tutela tributaria`,
    `"${companyShort}" tese tributaria OR creditamento pis cofins`,
  ]

  // -- LAYER 5: Partner/QSA names search --------------------------
  const partnerQueries: string[] = (input.qsa_names ?? [])
    .filter((n: string) => n && n.length > 5)
    .slice(0, 3)
    .map((n: string) => {
      const nameParts = n.trim().split(" ").slice(0, 3).join(" ")
      return `"${nameParts}" mandado seguranca tributario OR execucao fiscal`
    })

  if (partnerQueries.length > 0) {
    layersRun.push("Camada 5: Busca por socios QSA")
  }

  // Run all layers in parallel
  const allQueries = [...layer1Queries, ...layer2Queries, ...layer3Queries, ...layer4Queries, ...partnerQueries]
  const batchResults = await Promise.allSettled(
    allQueries.map(q => searchGoogleNews(q, 5))
  )

  const allResults: Array<{ title: string; desc: string; link: string; query: string; layer: number }> = []

  batchResults.forEach((r, idx) => {
    if (r.status !== "fulfilled") return
    const layer =
      idx < layer1Queries.length ? 1
      : idx < layer1Queries.length + layer2Queries.length ? 2
      : idx < layer1Queries.length + layer2Queries.length + layer3Queries.length ? 3
      : 4
    const query = allQueries[idx]
    sourcesSearched.push(query.slice(0, 70))
    r.value.forEach(item => allResults.push({ ...item, query, layer }))
  })

  // -- Tax intelligence: process all results ----------------------
  const seenProcesses = new Set<string>()
  const foundTesesSlugs = new Set<string>() // track which teses are already litigated

  for (const item of allResults) {
    const combined = `${item.title} ${item.desc}`
    const lc = combined.toLowerCase()

    // Must mention company or CNPJ
    const mentionsCompany =
      lc.includes(word1.toLowerCase()) ||
      combined.includes(cnpjClean) ||
      lc.includes(companyShort.toLowerCase().split(" ")[0].toLowerCase())
    if (!mentionsCompany) continue

    // Must have legal/tax signal
    const hasLegalSignal = /mandado|seguran[cç]a|processo|execu[cç][aã]o|compensa[cç][aã]o|trf\d|stj|stf|jusbrasil|escavador|tributar|fiscal|pis|cofins|icms|inss|diario\s+oficial/i.test(combined)
    if (!hasLegalSignal) continue

    const classified  = classifySubject(combined)
    const processNum  = extractProcessNumber(combined)
    const year        = extractYear(combined)
    const daysAgo     = extractDaysAgo(combined)
    const lawyerInfo  = extractLawyer(combined)

    const processKey = processNum ?? `${classified.tese_slug}-${item.title.slice(0, 40)}`
    if (seenProcesses.has(processKey)) continue
    seenProcesses.add(processKey)

    // Track which teses are already litigated
    if (classified.tese_slug !== "indefinido") {
      foundTesesSlugs.add(classified.tese_slug)
    }

    // Determine source quality
    const isJusbrasil  = item.link.includes("jusbrasil") || combined.toLowerCase().includes("jusbrasil")
    const isEscavador  = item.link.includes("escavador") || combined.toLowerCase().includes("escavador")
    const isPGFN       = item.link.includes("pgfn")
    const isDiario     = combined.toLowerCase().includes("diario oficial")
    const hasCNJ       = !!processNum
    const isTRFDirect  = combined.includes(trf)

    // Confidence scoring
    let confidenceScore = 0
    if (hasCNJ)        confidenceScore += 3
    if (isJusbrasil)   confidenceScore += 2
    if (isEscavador)   confidenceScore += 2
    if (isPGFN)        confidenceScore += 3
    if (isDiario)      confidenceScore += 2
    if (isTRFDirect)   confidenceScore += 1
    if (item.layer <= 2) confidenceScore += 1

    const confidence: "high" | "medium" | "low" =
      confidenceScore >= 5 ? "high"
      : confidenceScore >= 2 ? "medium"
      : "low"

    const sourceCount = [isJusbrasil, isEscavador, isPGFN, isDiario, hasCNJ].filter(Boolean).length + 1

    // Determine source label
    const sourceLabel =
      isPGFN       ? "PGFN (Divida Ativa)"
      : isDiario   ? "Diario Oficial"
      : isJusbrasil ? "JusBrasil"
      : isEscavador ? "Escavador"
      : isTRFDirect ? trf
      : "Indice publico"

    // Commercial intelligence
    const commercial_relevance: "alta" | "media" | "baixa" =
      classified.priority >= 8 ? "alta"
      : classified.priority >= 5 ? "media"
      : "baixa"

    const commercial_signal =
      classified.type === "execucao_fiscal"
        ? "Empresa com execucao fiscal ativa -- situacao defensiva. Abordagem cautelosa, foco em regularizacao antes de novas teses."
      : classified.type === "mandado_seguranca"
        ? `Empresa impetra MS sobre ${classified.subject} -- ja possui assessoria tributaria ativa. Diferenciar abordagem como complemento.`
      : classified.type === "compensacao" || classified.type === "per_dcomp"
        ? "Empresa ja realiza compensacoes tributarias -- processo interno estruturado. Abordar como parceiro de eficiencia."
      : `Empresa com historico de discussao em ${classified.subject} -- maturidade tributaria confirmada.`

    const approach_impact =
      classified.type === "execucao_fiscal"
        ? "Nao abordar com teses ofensivas. Foco em defesa e regularizacao."
      : classified.priority >= 8
        ? `Tese ${classified.subject} ja judicializada. NAO usar como abertura principal -- sugerir revisao complementar ou tese adjacente.`
      : "Contexto confirma maturidade. Abordar como parceiro tecnico avancado."

    const conflict_warning = classified.priority >= 8
      ? `Esta tese (${classified.subject}) ja foi identificada como possivelmente litigada. Verificar antes de propor como oportunidade.`
      : undefined

    // Track law firms
    if (lawyerInfo.firm) {
      const existing = lawFirmMap.get(lawyerInfo.firm) ?? { specialty: "Tributario", lawyers: [] }
      if (lawyerInfo.name && !existing.lawyers.includes(lawyerInfo.name)) {
        existing.lawyers.push(lawyerInfo.name)
      }
      lawFirmMap.set(lawyerInfo.firm, existing)
    }

    findings.push({
      type:             classified.type,
      theme:            classified.subject,
      subject_matter:   classified.subject,
      description:      item.title.slice(0, 280),
      process_number:   processNum ?? undefined,
      court:            isTRFDirect ? trf : sourceLabel,
      trf_ref:          trf,
      filing_year:      year ?? undefined,
      status:           "desconhecido",
      days_ago:         daysAgo,
      lawyer_name:      lawyerInfo.name,
      lawyer_oab:       lawyerInfo.oab,
      law_firm:         lawyerInfo.firm,
      source:           sourceLabel,
      source_url:       item.link || undefined,
      evidence:         item.title.slice(0, 220),
      confidence,
      source_count:     sourceCount,
      commercial_signal,
      commercial_relevance,
      approach_impact,
      conflict_warning,
      stj_ref:          classified.stj_ref,
      found_at:         now,
    })

    if (findings.length >= 10) break
  }

  // Sort: confidence first, then priority
  const typePriority: Record<LegalActionType, number> = {
    mandado_seguranca: 10, tese_tributaria: 9, compensacao: 7,
    tutela: 7, per_dcomp: 6, acao_ordinaria: 6, embargos: 5,
    recurso: 5, impugnacao: 5, execucao_fiscal: 4, indefinido: 1,
  }
  const confScore: Record<string, number> = { high: 30, medium: 15, low: 5 }
  findings.sort((a, b) =>
    (confScore[b.confidence] + typePriority[b.type]) -
    (confScore[a.confidence] + typePriority[a.type])
  )

  // Derive maturity level
  const hasMS         = findings.some(f => f.type === "mandado_seguranca")
  const hasTese       = findings.some(f => f.type === "tese_tributaria" || f.type === "compensacao")
  const hasExecucao   = findings.some(f => f.type === "execucao_fiscal")
  const highConf      = findings.filter(f => f.confidence === "high").length
  const medHighConf   = findings.filter(f => f.confidence !== "low").length

  const maturity_level: LegalMaturityLevel =
    (highConf >= 2 || (hasMS && hasTese)) ? "high"
    : (hasMS || (hasTese && medHighConf >= 1)) ? "medium"
    : (findings.length > 0) ? "low"
    : "none"

  const maturity_label =
    maturity_level === "high"
      ? "Alta maturidade tributaria -- empresa com historico consistente de judicializacao. Possui assessoria ativa."
    : maturity_level === "medium"
      ? "Maturidade tributaria identificada -- empresa ja discute teses fiscais. Abordagem tecnica recomendada."
    : maturity_level === "low"
      ? "Sinais incipientes de maturidade -- possivelmente em fase inicial de estruturacao tributaria."
    : "Nenhuma discussao tributaria confirmada nas fontes publicas consultadas nesta pesquisa."

  const litigation_profile =
    hasExecucao ? "reativo"
    : (hasMS && hasTese) ? "proativo_estruturado"
    : hasMS ? "proativo"
    : hasTese ? "estruturado"
    : "sem_historico_confirmado"

  const approach_shift =
    maturity_level === "high"
      ? "Empresa ja possui assessoria tributaria estruturada e ativa. Nao abordar como introdutor -- chegar com contexto tecnico diferenciado, complementar ao que ja existe."
    : maturity_level === "medium"
      ? "Empresa ja discute teses tributarias. Posicionar como parceiro estrategico avancado, nao como introdutor de temas novos."
    : maturity_level === "low"
      ? "Sinais de maturidade emergente. Validar profundidade da estrutura atual antes de propor teses especificas."
    : "Perfil sem historico juridico confirmado. Abordar como parceiro consultor -- abordagem educacional, identificar maturidade na ligacao."

  // Commercial impact block
  const litigatedTeses = Array.from(foundTesesSlugs).filter(s => s !== "execucao_fiscal" && s !== "indefinido")
  const impactBullets: string[] = []

  if (hasExecucao)  impactBullets.push("Empresa possui execucao fiscal ativa -- priorizar regularizacao antes de novas teses")
  if (hasMS)        impactBullets.push("Mandados de seguranca identificados -- empresa ja judicializa ativamente")
  if (lawFirmMap.size > 0) impactBullets.push(`Escritorio tributario identificado (${Array.from(lawFirmMap.keys())[0]}) -- assessoria ativa`)
  if (litigatedTeses.length > 0) impactBullets.push(`Teses ja judicializadas: ${litigatedTeses.slice(0,2).join(", ")} -- evitar como abertura`)
  if (maturity_level === "none") impactBullets.push("Sem historico tributario publico -- abordagem educacional adequada")

  const commercial_impact = {
    headline:
      maturity_level === "high" ? "Empresa com maturidade tributaria confirmada -- assessoria ativa"
      : maturity_level === "medium" ? "Empresa ja discute teses tributarias"
      : maturity_level === "low" ? "Sinais de maturidade em desenvolvimento"
      : "Perfil tributario nao confirmado nas fontes consultadas",
    bullets: impactBullets.length > 0 ? impactBullets : [
      approach_shift,
      "Confirmar maturidade na abertura da ligacao",
    ],
    recommended_angle:
      maturity_level === "high"   ? "Revisao complementar e teses adjacentes nao exploradas"
      : maturity_level === "medium" ? "Aprofundamento tecnico e complemento ao que ja existe"
      : "Mapeamento inicial e apresentacao de oportunidades"
    ,
    avoid: litigatedTeses.length > 0
      ? [`Propor como nova: ${litigatedTeses.slice(0,2).join(", ")}`, "Abordar como se empresa nao conhecesse o tema"]
      : maturity_level === "none"
      ? ["Jargao tecnico excessivo", "Pressao de prazo sem base"]
      : [],
  }

  const searchConf = sourcesSearched.length >= 12 ? "deep" : sourcesSearched.length >= 6 ? "moderate" : "shallow"

  const confidence_note =
    searchConf === "deep"
      ? `Pesquisa executada em ${allQueries.length} queries distribuidas em ${layersRun.length} camadas. ${findings.length} achados processados.`
    : searchConf === "moderate"
      ? `Pesquisa moderada em ${sourcesSearched.length} fontes consultadas. Cobertura parcial -- recomenda-se validar em CNJ.`
    : `Pesquisa inicial em ${sourcesSearched.length} fontes. Cobertura limitada -- fontes publicas tem indexacao parcial.`

  const caveat = findings.length === 0
    ? `Pesquisa realizada em ${allQueries.length} queries publicas (${layersRun.length} camadas: JusBrasil, Escavador, ${trf}, PGFN, Diario Oficial). A ausencia de resultados NAO confirma inexistencia de processos -- sistemas oficiais (CNJ, ${trf}) possuem cobertura mais completa que indices publicos.`
    : `${findings.length} achados de fontes publicas. Validar numeros de processo diretamente em ${trfData.url} e no portal CNJ (https://cnj.jus.br) para confirmacao oficial.`

  const copilot_signals = [
    ...(findings.slice(0, 2).map(f => f.commercial_signal)),
    ...(impactBullets.slice(0, 1)),
  ].filter(Boolean)

  return {
    company_name:      razao_social,
    cnpj,
    trf_competente:    trf,
    trf_url:           trfData.url,
    maturity_level,
    maturity_label,
    litigation_profile,
    approach_shift,
    commercial_impact,
    findings,
    law_firms:         Array.from(lawFirmMap.entries()).map(([name, data]) => ({ name, ...data })),
    copilot_signals,
    sources_searched:  [...new Set(sourcesSearched)].slice(0, 10),
    search_layers:     layersRun,
    search_confidence: searchConf,
    confidence_note,
    caveat,
    searched_at:       now,
  }

  } catch (err) {
    return {
      company_name:      input.razao_social,
      cnpj:              input.cnpj,
      trf_competente:    getTRFData(input.uf ?? "SP").trf,
      trf_url:           getTRFData(input.uf ?? "SP").url,
      maturity_level:    "none",
      maturity_label:    "Pesquisa juridica nao executada nesta sessao.",
      litigation_profile: "sem_historico_confirmado",
      approach_shift:    "Confirmar historico juridico diretamente na ligacao.",
      commercial_impact: {
        headline: "Pesquisa juridica indisponivel",
        bullets: ["Verificar diretamente no CNJ e sistema do TRF competente"],
        recommended_angle: "Confirmar maturidade na abertura da ligacao",
        avoid: [],
      },
      findings:          [],
      law_firms:         [],
      copilot_signals:   [],
      sources_searched:  [],
      search_layers:     [],
      search_confidence: "shallow",
      confidence_note:   "Pesquisa nao executada nesta sessao.",
      caveat:            "Erro ao executar pesquisa. Tente novamente ou consulte CNJ diretamente.",
      searched_at:       new Date().toISOString(),
    }
  }
}

// ----------------------------------------------------------------
// Copilot context builder
// ----------------------------------------------------------------

export function buildLegalCopilotContext(legal: LegalIntelligence) {
  return {
    maturity_level:        legal.maturity_level,
    approach_shift:        legal.approach_shift,
    commercial_impact:     legal.commercial_impact,
    litigated_teses:       legal.findings.filter(f => f.commercial_relevance === "alta").map(f => f.theme),
    primary_maker_opening: legal.findings.length > 0
      ? `Empresa ja possui historico de ${legal.findings[0].subject_matter} -- abordar como aprofundamento, nao introducao.`
      : null,
    avoid_in_opening: legal.maturity_level === "high"
      ? ["introducao basica ao tema", "explicar o que e mandado de seguranca", "urgencia artificial"]
      : [],
    opening_modifier: legal.maturity_level !== "none" ? legal.approach_shift : null,
  }
}
