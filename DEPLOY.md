# AXIOM — Guia de Deploy e Manutenção

## ⚠️ REGRA MAIS IMPORTANTE

**NUNCA recriar contas de usuários após um deploy.**

As contas ficam salvas no Upstash Redis independentemente do código.
Recriar contas gera um novo UUID e invalida o acesso de quem já estava logado.

---

## Como fazer um novo deploy

Sempre que houver atualização de código, siga exatamente essa ordem:

**Passo 1 — Extrair o novo zip**
```cmd
rmdir /s /q C:\Users\Pichau\Downloads\axiom-clean
mkdir C:\Users\Pichau\Downloads\axiom-clean
tar -xf C:\Users\Pichau\Downloads\axiom-v24.zip -C C:\Users\Pichau\Downloads\axiom-clean
```

**Passo 2 — Entrar na pasta**
```cmd
cd /d C:\Users\Pichau\Downloads\axiom-clean
```

**Passo 3 — Push para o GitHub**
```cmd
git init
git config user.email "dev@axiom.com"
git config user.name "AXIOM"
git add .
git commit -m "AXIOM update"
git branch -M main
git remote add origin https://github.com/MatheusGatti2728/Axiom.git
git push -f origin main
```

**Passo 4 — Aguardar**
O Vercel detecta o push e faz o deploy automaticamente.
Aguarde aparecer "Ready" no painel do Vercel (2-3 minutos).

**Passo 5 — Verificar variáveis**
```cmd
curl -H "x-debug-secret: axiom-debug-2026" https://axiom-ozpf.vercel.app/api/debug
```
Todas devem aparecer como SET.

**Pronto. Não recriar contas.**

---

## Contas da equipe interna

Estas contas têm acesso permanente ao plano Intelligence sem custo.
Ficam salvas no Upstash e sobrevivem a qualquer deploy.

| Nome | E-mail | Perfil |
|------|--------|--------|
| Matheus Gatti | matheus.gatti@grupostrategi.com.br | Admin |
| Carlos Bernardo | carlos.bernardo@grupostrategi.com.br | Consultor |
| Vitória Piccin | vitoria.piccin@grupostrategi.com.br | Consultor |
| Jéssica Santos | jessica.santos@grupostrategi.com.br | Consultor |
| Alexandre Lima | alexandre.lima@grupostrategi.com.br | Consultor |

---

## Quando recriar contas (situações raras)

Só recriar contas se:
- O Upstash for resetado manualmente
- A variável UPSTASH_REDIS_REST_URL for trocada no Vercel
- Um membro esquecer a senha e não conseguir usar "Alterar senha"

Para adicionar um novo membro:
```cmd
curl -X POST https://axiom-ozpf.vercel.app/api/admin/grant-access ^
  -H "x-admin-secret: axiom-admin-strategi-2026" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"novo@grupostrategi.com.br\",\"name\":\"Nome Completo\",\"note\":\"Consultor\",\"action\":\"create\"}"
```

Para listar todos os membros internos:
```cmd
curl -H "x-admin-secret: axiom-admin-strategi-2026" https://axiom-ozpf.vercel.app/api/admin/grant-access
```

Para revogar acesso:
```cmd
curl -X POST https://axiom-ozpf.vercel.app/api/admin/grant-access ^
  -H "x-admin-secret: axiom-admin-strategi-2026" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"membro@grupostrategi.com.br\",\"action\":\"revoke\"}"
```

---

## Variáveis de ambiente no Vercel

Todas configuradas no projeto axiom-ozpf.
**Nunca alterar sem necessidade.**

| Variável | Descrição |
|----------|-----------|
| NEXTAUTH_SECRET | Chave de segurança das sessões |
| NEXTAUTH_URL | URL do sistema (https://axiom-ozpf.vercel.app) |
| STRIPE_SECRET_KEY | Chave secreta do Stripe (sk_live_...) |
| STRIPE_PUBLISHABLE_KEY | Chave pública do Stripe (pk_live_...) |
| STRIPE_WEBHOOK_SECRET | Assinatura do webhook Stripe (whsec_...) |
| STRIPE_PRICE_CORE | Price ID do plano Core |
| STRIPE_PRICE_INTELLIGENCE | Price ID do plano Intelligence |
| STRIPE_PRICE_OPERATIONS | Price ID do plano Operations |
| UPSTASH_REDIS_REST_URL | URL do banco de dados Redis |
| UPSTASH_REDIS_REST_TOKEN | Token do banco de dados Redis |
| ANTHROPIC_API_KEY | Chave da API de IA (gerador de e-mail) |
| ADMIN_SECRET | Senha admin para gestão de usuários internos |

---

## Webhook do Stripe

URL configurada: `https://axiom-ozpf.vercel.app/api/stripe/webhook`

Eventos ativos:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_failed
- invoice.payment_succeeded

**Sem o webhook funcionando, pagamentos aprovados não ativam o acesso.**
Verificar em: dashboard.stripe.com → Developers → Webhooks

---

## URLs importantes

| Página | URL |
|--------|-----|
| Login | https://axiom-ozpf.vercel.app/login |
| Cadastro | https://axiom-ozpf.vercel.app/cadastro |
| Dashboard | https://axiom-ozpf.vercel.app/dashboard |
| Planos | https://axiom-ozpf.vercel.app/planos |
| Minha conta | https://axiom-ozpf.vercel.app/conta |
| Debug (admin) | https://axiom-ozpf.vercel.app/api/debug |

---

## Suporte técnico

Sistema desenvolvido por Claude (Anthropic) em parceria com Matheus Gatti.
Histórico completo de desenvolvimento disponível no GitHub.

AXIOM Tax Intelligence — Grupo Strategi — 2026
