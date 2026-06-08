// ================================================================
// AXIOM -- Email verification via Resend
// Token stored in Upstash Redis with 15min expiry
// ================================================================

// ------ Token storage (Upstash) ------------------------------------------------------------------------------------------------------------
async function redisSet(key: string, value: string, exSeconds: number): Promise<void> {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return
  try {
    await fetch(`${url}/setex/${encodeURIComponent(key)}/${exSeconds}`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify(value),
    })
  } catch {}
}

async function redisGet(key: string): Promise<string | null> {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    })
    const j = await r.json()
    return j.result ?? null
  } catch { return null }
}

async function redisDel(key: string): Promise<void> {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return
  try {
    await fetch(`${url}/del/${encodeURIComponent(key)}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    })
  } catch {}
}

// ------ Token management ---------------------------------------------------------------------------------------------------------------------------------
export async function createVerificationToken(userId: string, email: string): Promise<string> {
  const { randomUUID } = await import("crypto")
  const token = randomUUID().replace(/-/g, "")
  const key   = `verify:${token}`
  await redisSet(key, JSON.stringify({ userId, email }), 15 * 60) // 15 min
  return token
}

export async function validateVerificationToken(token: string): Promise<{ userId: string; email: string } | null> {
  const key = `verify:${token}`
  const raw = await redisGet(key)
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    await redisDel(key) // single use
    return data
  } catch { return null }
}

// ------ Send email via Resend ------------------------------------------------------------------------------------------------------------------
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
  baseUrl: string,
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.warn("[email] RESEND_API_KEY not set - skipping email send")
    return
  }

  const verifyUrl = `${baseUrl}/verificar?token=${token}`
  const firstName = name.split(" ")[0]

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080C14;font-family:'Inter',-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080C14;padding:48px 0;">
  <tr><td align="center">
    <table width="480" cellpadding="0" cellspacing="0" style="background:#0D1520;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;">
      
      <!-- Header -->
      <tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:28px;height:28px;background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:6px;text-align:center;vertical-align:middle;">
            <span style="color:#fff;font-size:14px;font-weight:700;font-family:'Space Grotesk',sans-serif;">A</span>
          </td>
          <td style="padding-left:10px;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#F1F5F9;letter-spacing:-0.02em;">AXIOM</td>
        </tr></table>
      </td></tr>
      
      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        <p style="font-size:11px;font-weight:700;color:#4F46E5;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">Validacao de acesso</p>
        <h1 style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:#F1F5F9;letter-spacing:-0.03em;margin:0 0 16px;">Seu ambiente foi criado, ${firstName}.</h1>
        <p style="font-size:14px;color:#64748B;line-height:1.7;margin:0 0 32px;">Clique no botao abaixo para validar seu acesso e comecar a usar o AXIOM Intelligence Platform.</p>
        
        <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr><td style="background:#4F46E5;border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,0.4);">
            <a href="${verifyUrl}" style="display:block;padding:14px 32px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;font-family:'Space Grotesk',sans-serif;letter-spacing:-0.01em;">
              Validar acesso &rarr;
            </a>
          </td></tr>
        </table>
        
        <p style="font-size:12px;color:#334155;margin:0 0 8px;">Ou copie o link:</p>
        <p style="font-size:11px;color:#1E293B;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:10px;word-break:break-all;font-family:monospace;margin:0 0 32px;">${verifyUrl}</p>
        
        <p style="font-size:12px;color:#334155;margin:0;">Este link expira em <strong style="color:#64748B">15 minutos</strong> e pode ser usado apenas uma vez.</p>
      </td></tr>
      
      <!-- Footer -->
      <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
        <p style="font-size:11px;color:#1E293B;margin:0 0 4px;">AXIOM Intelligence Platform &mdash; uso exclusivo do titular desta conta.</p>
        <p style="font-size:11px;color:#1E293B;margin:0;">Se voce nao criou esta conta, ignore este e-mail com seguranca.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

  try {
    await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM ?? "AXIOM <onboarding@resend.dev>",
        to:      [to],
        subject: "Confirme seu acesso ao AXIOM",
        html,
      }),
    })
  } catch (err) {
    console.error("[email] send failed", err)
  }
}
