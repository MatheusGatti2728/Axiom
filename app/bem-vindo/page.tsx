"use client"

import React, { useEffect, useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

const STEPS = [
  "Confirmando pagamento...",
  "Ativando sua conta...",
  "Configurando workspace...",
  "Preparando ambiente AXIOM...",
  "Quase pronto...",
]

function BemVindoContent() {
  const router  = useRouter()
  const params  = useSearchParams()
  const [step,  setStep]  = useState(0)
  const [error, setError] = useState("")
  const [info,  setInfo]  = useState("Aguardando confirmação do pagamento...")

  useEffect(() => {
    const token = params.get("token")
    const plano = params.get("plano") ?? "core"

    if (!token) {
      setError("Link inválido. Faça login para acessar sua conta.")
      return
    }

    let stepIdx = 0
    const stepInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1)
      setStep(stepIdx)
    }, 3000)

    async function activate() {
      try {
        // 1. Get credentials from temp token
        const credRes = await fetch(`/api/auth/temp-login?token=${token}`)
        if (!credRes.ok) {
          clearInterval(stepInterval)
          setError("Link de ativação expirado. Faça login com seu e-mail e senha.")
          return
        }
        const { email, password } = await credRes.json()

        // 2. Poll check-activation (not signIn) — 30 attempts × 3s = 90s max
        let activated = false
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 3000))

          setInfo(`Verificando ativação... (${i + 1}/30)`)

          const checkRes = await fetch(`/api/auth/check-activation?email=${encodeURIComponent(email)}`)
          const check    = await checkRes.json()

          if (check.active) {
            activated = true
            setInfo("Conta ativada! Fazendo login...")
            break
          }
        }

        clearInterval(stepInterval)

        if (!activated) {
          // Webhook took too long — send to login with friendly message
          setError("Pagamento confirmado! Sua conta será ativada em instantes. Faça login para acessar.")
          return
        }

        // 3. Now do ONE signIn with confirmed active account
        setStep(STEPS.length - 1)
        const result = await signIn("credentials", {
          email, password, redirect: false,
        })

        if (result?.ok && !result?.error) {
          await new Promise(r => setTimeout(r, 600))
          router.push("/dashboard")
        } else {
          // signIn failed even though account is active — go to login
          router.push("/login?pago=true")
        }

      } catch (err) {
        clearInterval(stepInterval)
        setError("Pagamento confirmado. Faça login com seu e-mail e senha para acessar.")
      }
    }

    activate()
    return () => clearInterval(stepInterval)
  }, [params, router])

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAFBFC",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',-apple-system,sans-serif",
      padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>

        {/* Logo */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
          <div style={{ width: 24, height: 24, background: "#0B0F19", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#F1F5F9", fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
          </div>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: "#0C1222", letterSpacing: "-0.02em" }}>AXIOM</p>
        </div>

        {error ? (
          <div>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ fontSize: 20, color: "#10B981" }}>✓</span>
            </div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: "#0C1222", marginBottom: 10, letterSpacing: "-0.03em" }}>
              Pagamento confirmado
            </p>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7, marginBottom: 28 }}>
              {error}
            </p>
            <a href="/login?pago=true" style={{
              display: "inline-block", padding: "11px 32px",
              background: "#4F46E5", color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              fontFamily: "'Space Grotesk',sans-serif",
              transition: "all 150ms",
            }}>
              Acessar plataforma →
            </a>
          </div>
        ) : (
          <div>
            {/* Spinner */}
            <div style={{ position: "relative", width: 56, height: 56, margin: "0 auto 36px" }}>
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ animation: "spin 1.2s linear infinite" }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(79,70,229,0.10)" strokeWidth="2" />
                <path d="M28 6 A22 22 0 0 1 50 28" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: "#0C1222", letterSpacing: "-0.03em", marginBottom: 8 }}>
              Ativando seu acesso
            </p>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 8, minHeight: 20 }}>
              {STEPS[step]}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#94A3B8", marginBottom: 32 }}>
              {info}
            </p>

            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 36 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 18 : 5, height: 5,
                  borderRadius: 99,
                  background: i <= step ? "#4F46E5" : "#E2E8F0",
                  transition: "all 300ms",
                }} />
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#CBD5E1" }}>
              Não feche esta janela.
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function BemVindoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#FAFBFC" }} />}>
      <BemVindoContent />
    </Suspense>
  )
}
