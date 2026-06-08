import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 400, width: "100%", padding: "0 24px" }}>

        <a href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 64, textDecoration: "none" }}>
          <div style={{ width: 20, height: 20, background: "var(--side-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--side-text-1)", fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>AXIOM</span>
        </a>

        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--ink-5)", letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 16 }}>
          Erro 404
        </p>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.04em", marginBottom: 12 }}>
          Página não encontrada.
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-4)", lineHeight: 1.7, marginBottom: 40 }}>
          O endereço acessado não existe ou foi movido. Verifique o link ou navegue para uma das páginas abaixo.
        </p>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--v)", color: "#fff", textDecoration: "none", transition: "all 150ms" }}>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" }}>Ir para o Dashboard</span>
            <span style={{ fontSize: 13 }}>→</span>
          </Link>
          <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--white)", border: "1px solid var(--rule-mid)", color: "var(--ink-2)", textDecoration: "none", transition: "all 150ms" }}>
            <span style={{ fontSize: 13, fontFamily: "'Inter',sans-serif" }}>Fazer login</span>
            <span style={{ fontSize: 13 }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
