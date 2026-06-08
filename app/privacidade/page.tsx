"use client"
import React from "react"

export default function PrivacidadePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFBFC", backgroundImage: "linear-gradient(rgba(79,70,229,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,70,229,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px", fontFamily: "'Inter',sans-serif", color: "#0C1222", padding: "60px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="/login" style={{ fontSize: 12, color: "#475569", textDecoration: "none", display: "block", marginBottom: 40, transition: "color 150ms" }}>← Voltar</a>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
          <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#4338CA,#6D28D9)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>AXIOM Tax Intelligence</span>
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>Política de Privacidade</h1>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 48 }}>Última atualização: maio de 2026</p>

        {[
          {
            title: "1. Quem somos",
            text: "A AXIOM Tax Intelligence é uma plataforma de inteligência comercial tributária operada pelo Grupo Strategi. Para dúvidas sobre esta política, entre em contato pelo e-mail: privacidade@grupostrategi.com.br"
          },
          {
            title: "2. Dados que coletamos",
            text: "Coletamos os seguintes dados pessoais fornecidos diretamente por você no momento do cadastro: nome completo, endereço de e-mail profissional, número de telefone/WhatsApp, CPF e dados de perfil operacional (tipo de operação, volume de análises, foco de atuação e número de usuários). Não coletamos dados de navegação, cookies de rastreamento ou informações sensíveis além das listadas."
          },
          {
            title: "3. Base legal e finalidade",
            text: "O tratamento dos seus dados é realizado com base no contrato de prestação de serviços (Art. 7º, V da LGPD) e no legítimo interesse (Art. 7º, IX da LGPD). Os dados são utilizados exclusivamente para: (a) criação e gestão da sua conta; (b) personalização da sua experiência na plataforma; (c) cobrança e gestão da assinatura; (d) comunicações relacionadas ao serviço contratado."
          },
          {
            title: "4. Compartilhamento de dados",
            text: "Seus dados são compartilhados apenas com: (a) Stripe — processador de pagamentos, para gestão da assinatura; (b) Upstash — banco de dados em nuvem, para armazenamento seguro; (c) Vercel — infraestrutura de hospedagem. Nenhum dado é vendido, alugado ou compartilhado com terceiros para fins de marketing ou publicidade."
          },
          {
            title: "5. Armazenamento e segurança",
            text: "Seus dados são armazenados com criptografia em repouso e em trânsito. As senhas nunca são armazenadas em texto puro — utilizamos o algoritmo bcrypt. O acesso à plataforma é protegido por SSL 256-bit e autenticação com sessão única por conta."
          },
          {
            title: "6. Seus direitos",
            text: "Conforme a LGPD, você tem direito a: (a) confirmar a existência de tratamento dos seus dados; (b) acessar seus dados; (c) corrigir dados incompletos, inexatos ou desatualizados; (d) solicitar a eliminação dos seus dados; (e) revogar o consentimento. Para exercer qualquer desses direitos, entre em contato pelo e-mail: privacidade@grupostrategi.com.br"
          },
          {
            title: "7. Retenção de dados",
            text: "Seus dados são mantidos enquanto sua conta estiver ativa. Após o cancelamento da conta, os dados são eliminados em até 90 dias, exceto quando houver obrigação legal de retenção."
          },
          {
            title: "8. CPF",
            text: "O CPF é coletado exclusivamente para fins de identificação e prevenção de fraudes. Não é utilizado para consultas em bureaus de crédito ou compartilhado com terceiros além dos processadores de pagamento quando necessário."
          },
          {
            title: "9. Contato e DPO",
            text: "Responsável pelo tratamento de dados: Grupo Strategi. Encarregado de Dados (DPO): privacidade@grupostrategi.com.br. Para dúvidas ou solicitações relacionadas à LGPD, utilize este e-mail."
          },
          {
            title: "10. Alterações desta política",
            text: "Esta política pode ser atualizada periodicamente. Notificaremos você por e-mail em caso de alterações significativas. O uso continuado da plataforma após notificação implica aceite das novas condições."
          },
        ].map(({ title, text }) => (
          <div key={title} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: "1px solid #E2E8F0" }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600, color: "#0C1222", marginBottom: 12 }}>{title}</h2>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
