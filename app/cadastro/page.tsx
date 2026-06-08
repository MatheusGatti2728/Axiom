"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"

function validarCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, "")
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i)
  let r = (s * 10) % 11; if (r === 10 || r === 11) r = 0
  if (r !== parseInt(c[9])) return false
  s = 0
  for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i)
  r = (s * 10) % 11; if (r === 10 || r === 11) r = 0
  return r === parseInt(c[10])
}

// ── Field must be OUTSIDE the page component to prevent focus loss ─────────
interface FieldProps {
  id: string; label: string; type?: string; value: string
  placeholder: string; maxLength?: number; disabled?: boolean
  error?: string; onChange: (v: string) => void
}
function Field({ id, label, type = "text", value, placeholder, maxLength, disabled, error, onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} style={lbl}>{label}</label>
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        maxLength={maxLength} disabled={disabled} autoComplete={id}
        onChange={e => onChange(e.target.value)}
        aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
        style={{ ...inp, borderColor: error ? "var(--red)" : undefined }}
      />
      {error && <p id={`${id}-err`} role="alert" style={errStyle}>{error}</p>}
    </div>
  )
}

export default function CadastroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name:"", email:"", phone:"", cpf:"", pass:"", pass2:"" })
  const [consent, setConsent] = useState(false)
  const [errs,    setErrs]    = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    setErrs(e => ({ ...e, [k]: "" }))
  }

  function validate() {
    const e: Record<string,string> = {}
    if (!form.name.trim())                               e.name    = "Nome obrigatório."
    if (!form.email.trim() || !form.email.includes("@")) e.email   = "E-mail inválido."
    if (!form.phone.trim())                              e.phone   = "Telefone obrigatório."
    if (!validarCPF(form.cpf))                           e.cpf     = "CPF inválido."
    if (form.pass.length < 8)                            e.pass    = "Mínimo 8 caracteres."
    if (form.pass !== form.pass2)                        e.pass2   = "As senhas não coincidem."
    if (!consent)                                        e.consent = "Aceite os termos para continuar."
    setErrs(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    sessionStorage.setItem("axiom_reg", JSON.stringify({
      name: form.name, email: form.email, phone: form.phone,
      cpf: form.cpf, password: form.pass,
    }))
    setTimeout(() => router.push("/onboarding"), 200)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <a href="/login" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48, textDecoration: "none" }}>
          <div style={{ width: 20, height: 20, background: "var(--side-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--side-text-1)", fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>AXIOM</span>
        </a>

        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.04em", marginBottom: 8 }}>
          Solicitar acesso
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-4)", marginBottom: 36, lineHeight: 1.6 }}>
          Preencha seus dados profissionais para continuar.
        </p>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>

          <Field id="name"  label="Nome completo"      type="text"     value={form.name}  placeholder="Seu nome completo"       disabled={loading} error={errs.name}  onChange={v => set("name",  v)} />
          <Field id="email" label="E-mail corporativo" type="email"    value={form.email} placeholder="nome@empresa.com.br"      disabled={loading} error={errs.email} onChange={v => set("email", v)} />
          <Field id="phone" label="Telefone (com DDD)" type="tel"      value={form.phone} placeholder="(11) 99999-9999"          disabled={loading} error={errs.phone} onChange={v => set("phone", v)} />
          <Field id="cpf"   label="CPF"                type="text"     value={form.cpf}   placeholder="000.000.000-00" maxLength={14} disabled={loading} error={errs.cpf} onChange={v => set("cpf", v)} />
          <Field id="pass"  label="Senha"              type="password" value={form.pass}  placeholder="Mínimo 8 caracteres"     disabled={loading} error={errs.pass}  onChange={v => set("pass",  v)} />
          <Field id="pass2" label="Confirmar senha"    type="password" value={form.pass2} placeholder="Repita a senha"          disabled={loading} error={errs.pass2} onChange={v => set("pass2", v)} />

          <div>
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
              <input
                type="checkbox" checked={consent}
                onChange={e => { setConsent(e.target.checked); setErrs(v => ({ ...v, consent: "" })) }}
                style={{ marginTop: 3, accentColor: "var(--v)", width: 14, height: 14, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: "var(--ink-4)", lineHeight: 1.7 }}>
                Li e aceito os{" "}
                <a href="/termos" target="_blank" style={{ color: "var(--v)", textDecoration: "none", fontWeight: 500 }}>Termos de Uso</a>
                {" "}e a{" "}
                <a href="/privacidade" target="_blank" style={{ color: "var(--v)", textDecoration: "none", fontWeight: 500 }}>Política de Privacidade</a>
              </span>
            </label>
            {errs.consent && <p role="alert" style={{ ...errStyle, marginLeft: 24 }}>{errs.consent}</p>}
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              padding: "12px 0", border: "none", marginTop: 8,
              background: loading ? "var(--lift)" : "var(--v)",
              color: loading ? "var(--ink-5)" : "#fff",
              fontSize: 13, fontWeight: 600,
              fontFamily: "'Space Grotesk',sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 150ms",
            }}>
            {loading ? "Salvando..." : "Continuar →"}
          </button>
        </form>

        <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
          <p style={{ fontSize: 13, color: "var(--ink-5)" }}>
            Já tem acesso?{" "}
            <a href="/login" style={{ color: "var(--v)", textDecoration: "none", fontWeight: 500 }}>Fazer login</a>
          </p>
        </div>
      </div>
      <style>{`
        input::placeholder { color: var(--ink-5); }
        input:focus { border-color: var(--v) !important; box-shadow: 0 0 0 3px var(--v-wash) !important; outline: none !important; }
      `}</style>
    </div>
  )
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-3)", marginBottom: 8, letterSpacing: "0.01em" }
const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box" as const, background: "var(--white)", border: "1px solid var(--rule-mid)", color: "var(--ink-1)", fontFamily: "'Inter',sans-serif", fontSize: 14, padding: "10px 14px", outline: "none", transition: "border-color 150ms, box-shadow 150ms" }
const errStyle: React.CSSProperties = { fontSize: 12, color: "var(--red)", marginTop: 4 }
