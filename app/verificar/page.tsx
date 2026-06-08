"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function VerificarContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    const token = params.get("token")
    if (!token) { setStatus("error"); setMsg("Token invalido."); return }

    fetch(`/api/auth/verify?token=${token}`, { redirect: "manual" })
      .then(res => {
        if (res.status === 302 || res.ok) {
          setStatus("ok")
          setMsg("E-mail verificado com sucesso.")
          setTimeout(() => router.push("/login?verified=true"), 2000)
        } else {
          setStatus("error")
          setMsg("Link invalido ou expirado.")
        }
      })
      .catch(() => { setStatus("error"); setMsg("Erro de conexao.") })
  }, [params, router])

  return (
    <div style={{ minHeight: "100vh", background: "#080C14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 360, padding: "0 20px" }}>
        <div style={{ width: 48, height: 48, background: status === "ok" ? "rgba(5,150,105,0.1)" : status === "error" ? "rgba(239,68,68,0.1)" : "rgba(79,70,229,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          {status === "loading" && <Spin />}
          {status === "ok"      && <span style={{ fontSize: 22, color: "#059669" }}>✓</span>}
          {status === "error"   && <span style={{ fontSize: 22, color: "#EF4444" }}>✕</span>}
        </div>
        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>
          {status === "loading" ? "Verificando..." : status === "ok" ? "Acesso validado" : "Link invalido"}
        </p>
        <p style={{ fontSize: 13, color: "#475569" }}>{msg || "Validando seu token de acesso..."}</p>
        {status === "error" && (
          <a href="/cadastro" style={{ display: "inline-block", marginTop: 20, fontSize: 13, color: "#818CF8", textDecoration: "none" }}>
            Criar uma nova conta
          </a>
        )}
      </div>
    </div>
  )
}

function Spin() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="10" cy="10" r="8" stroke="rgba(79,70,229,0.3)" strokeWidth="2.5" />
      <path d="M10 2A8 8 0 0 1 18 10" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  )
}

export default function VerificarPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#080C14" }} />}>
      <VerificarContent />
    </Suspense>
  )
}
