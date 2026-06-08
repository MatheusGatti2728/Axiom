# AXIOM — Setup de Assinaturas (R$ 97/mes)

## O que foi implementado

- Login e cadastro de usuarios (`/login`)
- Pagina de precos e checkout (`/pricing`)
- Gerenciamento de conta (`/conta`)
- Protecao de rotas via middleware (so acessa `/dashboard` quem tem assinatura ativa)
- Integracao com Stripe (pagamento, webhook, portal do cliente)
- Trial de 7 dias gratis automatico

---

## Passo 1 — Instalar dependencias

```bash
cd axiom
npm install --legacy-peer-deps next-auth bcryptjs stripe @types/bcryptjs
```

---

## Passo 2 — Configurar Stripe

1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Ative o modo de producao (ou use modo teste primeiro)
3. Crie um produto:
   - Nome: **AXIOM Pro**
   - Preco: **R$ 97,00** / mes / recorrente / BRL
   - Copie o **Price ID** (comeca com `price_`)
4. Copie as chaves de API em **Developers > API keys**
5. Crie um webhook em **Developers > Webhooks**:
   - URL: `https://SEU-DOMINIO.vercel.app/api/stripe/webhook`
   - Eventos a escutar:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copie o **Webhook signing secret**

---

## Passo 3 — Configurar variaveis de ambiente

No Vercel (Settings > Environment Variables), adicione:

```
NEXTAUTH_SECRET        = <execute: openssl rand -base64 32>
NEXTAUTH_URL           = https://SEU-DOMINIO.vercel.app

STRIPE_SECRET_KEY      = sk_live_...
STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_PRICE_ID        = price_...
STRIPE_WEBHOOK_SECRET  = whsec_...

AXIOM_USERS_DATA       = (deixe vazio por enquanto)
```

---

## Passo 4 — Deploy no Vercel

```bash
git add .
git commit -m "feat: auth + stripe subscriptions"
git push origin main
```

---

## Como funciona o fluxo

```
Usuario acessa /dashboard
       ↓
middleware.ts verifica session
       ↓
Sem session → /login
Com session mas sem assinatura → /pricing
Com assinatura ativa → /dashboard (acesso liberado)
```

**Cadastro e pagamento:**
1. Usuario cria conta em `/login`
2. E redirecionado para `/pricing`
3. Clica em "Comecar 7 dias gratis"
4. Vai para o Stripe Checkout (hospedado pelo Stripe, seguro)
5. Paga com cartao → Stripe envia webhook para `/api/stripe/webhook`
6. Webhook ativa a assinatura do usuario
7. Usuario e redirecionado para `/dashboard?assinatura=ativa`

---

## Limitacao atual e migracao futura

O armazenamento de usuarios usa memoria em processo + variavel de ambiente.
Isso funciona para os primeiros 200-500 usuarios.

Para escalar, migre para **Vercel KV** (Redis):
```bash
npm install @vercel/kv
```
E substitua as funcoes em `lib/auth/users.ts` por chamadas ao KV.

---

## Teste local

```bash
# Use chaves de TESTE do Stripe (sk_test_...)
# Configure NEXTAUTH_URL=http://localhost:3000
# Webhook local: use Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
