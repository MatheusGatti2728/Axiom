"use client"
import React from "react"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ margin: 0, background: "#05080F", fontFamily: "'Inter',sans-serif" }}>
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", padding: "24px",
        }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <span style={{ color: "#EF4444", fontSize: 20 }}>!</span>
            </div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 10 }}>
              Algo deu errado
            </p>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 28, lineHeight: 1.7 }}>
              Ocorreu um erro inesperado. Nossa equipe foi notificada.
            </p>
            <button onClick={reset} style={{
              padding: "10px 24px", background: "#4F46E5", border: "none",
              borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif",
              marginRight: 10,
            }}>
              Tentar novamente
            </button>
            <a href="/dashboard" style={{
              display: "inline-block", padding: "10px 24px",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
              color: "#64748B", fontSize: 13, textDecoration: "none",
            }}>
              Voltar ao início
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
