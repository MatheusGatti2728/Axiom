"use client"
import React from "react"

export default function TermosPage() {
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

        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>Termos de Uso</h1>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 48 }}>Última atualização: maio de 2026</p>

        {[
          {
            title: "1. Aceitação",
            text: "Ao criar uma conta na plataforma AXIOM Tax Intelligence, você declara ter lido, compreendido e aceito integralmente estes Termos de Uso e a Política de Privacidade. Caso não concorde, não utilize a plataforma."
          },
          {
            title: "2. O serviço",
            text: "A AXIOM Tax Intelligence é uma plataforma SaaS de inteligência comercial tributária que gera dossiês estratégicos a partir de CNPJs públicos. As informações geradas são de caráter informativo e não substituem aconselhamento jurídico ou tributário profissional."
          },
          {
            title: "3. Cadastro e conta",
            text: "Você é responsável por manter a confidencialidade das suas credenciais de acesso. É proibido compartilhar sua senha ou conta com terceiros. O AXIOM implementa controle de sessão única — apenas um acesso simultâneo por conta é permitido. A criação de conta com dados falsos ou a utilização da plataforma para fins ilegais resultará em cancelamento imediato."
          },
          {
            title: "4. Planos e pagamento",
            text: "O acesso à plataforma está condicionado à contratação de um dos planos disponíveis e ao pagamento da mensalidade correspondente. O período de trial de 7 dias é gratuito e não requer cartão de crédito para início. Após o trial, a cobrança é automática conforme o plano escolhido. O cancelamento pode ser feito a qualquer momento pelo painel da conta, sem multa."
          },
          {
            title: "5. Limites de uso",
            text: "Cada plano possui um limite mensal de análises estratégicas conforme especificado na página de preços. O excedente é cobrado conforme a tabela vigente. O uso da plataforma para fins de scraping, revenda de dados ou qualquer finalidade não prevista é expressamente proibido."
          },
          {
            title: "6. Propriedade intelectual",
            text: "Toda a tecnologia, algoritmos, interfaces e conteúdo da plataforma AXIOM são de propriedade exclusiva do Grupo Strategi. É vedada a reprodução, cópia, distribuição ou engenharia reversa de qualquer componente da plataforma."
          },
          {
            title: "7. Limitação de responsabilidade",
            text: "O AXIOM utiliza dados públicos e técnicas de inteligência artificial para gerar análises. As informações geradas têm caráter orientativo e não constituem parecer jurídico, tributário ou financeiro. O Grupo Strategi não se responsabiliza por decisões tomadas com base exclusiva nas análises da plataforma."
          },
          {
            title: "8. Cancelamento e rescisão",
            text: "Você pode cancelar sua assinatura a qualquer momento. O acesso permanece ativo até o fim do período pago. O Grupo Strategi reserva-se o direito de suspender ou cancelar contas que violem estes termos, sem aviso prévio e sem reembolso."
          },
          {
            title: "9. Foro e lei aplicável",
            text: "Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de Campinas/SP para dirimir quaisquer controvérsias decorrentes deste instrumento."
          },
          {
            title: "10. Contato",
            text: "Para dúvidas sobre estes Termos, entre em contato pelo e-mail: contato@grupostrategi.com.br"
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
