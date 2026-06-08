import type { Metadata } from "next"
import "./globals.css"
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper"

export const metadata: Metadata = {
  title: "AXIOM Tax Intelligence — Inteligência Comercial Tributária",
  description: "Plataforma corporativa de inteligência tributária e comercial. Dossiê estratégico completo em menos de 60 segundos. Para consultores e assessorias de alta performance.",
  keywords: "inteligência tributária, consultoria tributária, CNPJ, dossiê, planejamento tributário, assessoria tributária",
  authors: [{ name: "Grupo Strategi" }],
  robots: "noindex, nofollow",
  openGraph: {
    title: "AXIOM Tax Intelligence",
    description: "Plataforma corporativa de inteligência tributária. Dossiê estratégico completo em menos de 60 segundos.",
    type: "website",
    locale: "pt_BR",
    siteName: "AXIOM Tax Intelligence",
  },
  twitter: {
    card: "summary",
    title: "AXIOM Tax Intelligence",
    description: "Plataforma corporativa de inteligência tributária e comercial.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
