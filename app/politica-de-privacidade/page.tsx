import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LegalContainer from '@/components/LegalContainer'
import { createPageMetadata } from '@/lib/seo'
import { encarregadoLegal, identificacaoLegal } from '@/lib/legal'
import { leadSubmissionEnabled } from '@/lib/lead-availability'

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Política de Privacidade',
    description: 'Como a Gandra Tecnologia trata dados no seu site institucional.',
    path: '/politica-de-privacidade',
  }),
  robots: { index: false, follow: false },
  title: { absolute: 'Política de Privacidade — Gandra Tecnologia' },
}

export default function PoliticaDePrivacidade() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* Modelo base técnico; a validação final por advogado é recomendada antes do uso comercial. */}
        <LegalContainer
          eyebrow="INFORMAÇÕES LEGAIS"
          title="Política de Privacidade"
          intro="Como o site institucional da Gandra Tecnologia trata dados pessoais e informações técnicas."
          updatedAt="09/11/2026"
        >
          <section aria-labelledby="privacidade-introducao">
            <h2 id="privacidade-introducao">1. Compromisso com a privacidade</h2>
            <p>
              A Gandra Tecnologia respeita a privacidade e trata dados pessoais de forma limitada,
              transparente e compatível com a finalidade deste site institucional. Esta política
              apresenta o cenário atual e deve ser revisada quando houver novas ferramentas,
              integrações ou formas de coleta.
            </p>
          </section>

          <section aria-labelledby="privacidade-controlador">
            <h2 id="privacidade-controlador">2. Controlador dos dados</h2>
            <p>
              {identificacaoLegal}
            </p>
            <p>
              O canal de privacidade e contato do titular é{' '}
              <a href="mailto:contato@gandra.tech">contato@gandra.tech</a>. {encarregadoLegal}
            </p>
          </section>

          <section aria-labelledby="privacidade-dados">
            <h2 id="privacidade-dados">3. Dados coletados</h2>
            {leadSubmissionEnabled ? (
              <p>
                Ao enviar um pedido de orçamento diretamente pelo formulário, recebemos
                nome, e-mail ou telefone/WhatsApp, serviço desejado e mensagem do projeto.
                Essas informações são utilizadas para responder à solicitação comercial.
                A alternativa de contato por e-mail continua disponível.
              </p>
            ) : (
              <p>
                Atualmente, os campos do orçamento apenas preparam uma mensagem no navegador:
                o site não recebe esses dados por um formulário próprio, nem possui área de login.
                Só recebemos o que o visitante efetivamente enviar pelo aplicativo de e-mail,
                usando o link{' '}
                <a href="mailto:contato@gandra.tech">contato@gandra.tech</a>.
              </p>
            )}
            <p>
              A infraestrutura de hospedagem pode processar registros técnicos de acesso e
              segurança, como endereço IP, identificadores do navegador e cookies de proteção,
              conforme o recurso acionado. O site utiliza Cloudflare Web Analytics para medição
              de visitas e desempenho, sem publicidade comportamental própria. Preferências de
              animação e navegação ficam no armazenamento do navegador, conforme a{' '}
              <Link href="/politica-de-cookies">Política de Cookies e Armazenamento</Link>.
            </p>
          </section>

          <section aria-labelledby="privacidade-finalidades">
            <h2 id="privacidade-finalidades">4. Finalidades do tratamento</h2>
            <ul>
              <li>Responder a contatos e solicitações comerciais enviados voluntariamente.</li>
              <li>Manter a segurança, a disponibilidade e o funcionamento do site.</li>
              <li>Entender de forma agregada o acesso e o desempenho das páginas.</li>
            </ul>
            <p>
              Para responder a uma solicitação de orçamento iniciada pelo próprio visitante,
              o tratamento pode se apoiar em procedimentos preliminares relacionados a um
              possível contrato, nos termos do art. 7º, V, da LGPD. Medidas de segurança,
              obrigações legais e análises técnicas exigem avaliação das bases legais pertinentes
              a cada finalidade. O envio de orçamento não equivale a autorização para receber
              campanhas promocionais não solicitadas.
            </p>
          </section>

          <section aria-labelledby="privacidade-compartilhamento">
            <h2 id="privacidade-compartilhamento">5. Compartilhamento</h2>
            <p>
              A Gandra Tecnologia não vende dados pessoais. A Cloudflare fornece hospedagem,
              proteção e medição de acesso; o provedor da caixa postal participa do envio e
              recebimento de mensagens. Esses fornecedores podem tratar dados técnicos ou de
              comunicação conforme o serviço utilizado e seus próprios compromissos contratuais.
            </p>
            {leadSubmissionEnabled && (
              <p>
                Quando o envio direto estiver ativado, os pedidos passarão por verificação
                antispam (Cloudflare Turnstile) e pelo serviço configurado para envio de e-mail,
                além do provedor da caixa postal de destino. O formulário não foi projetado para
                manter uma base própria de pedidos; as mensagens recebidas permanecem na caixa
                de e-mail da empresa, sujeitas às rotinas de retenção e exclusão aplicáveis.
              </p>
            )}
          </section>

          <section aria-labelledby="privacidade-cookies">
            <h2 id="privacidade-cookies">6. Cookies e preferências do navegador</h2>
            <p>
              O site utiliza armazenamento local e de sessão para lembrar preferências de animação,
              som e navegação. A infraestrutura pode emitir cookies de segurança em verificações
              específicas. O Cloudflare Web Analytics utiliza um script de medição sem cookies
              publicitários; não há pixels de publicidade personalizados implementados no código.
              Consulte a <Link href="/politica-de-cookies">Política de Cookies e Armazenamento</Link>{' '}
              para ver cada finalidade e como apagar as preferências.
            </p>
          </section>

          <section aria-labelledby="privacidade-direitos">
            <h2 id="privacidade-direitos">7. Direitos do titular</h2>
            <p>
              Nos termos da Lei nº 13.709/2018 (LGPD), o titular pode solicitar, conforme o caso,
              confirmação da existência de tratamento, acesso, correção, anonimização, bloqueio,
              eliminação, portabilidade, informação sobre compartilhamentos e revogação do
              consentimento, quando essa for a base legal aplicável.
            </p>
            <p>
              As solicitações devem ser enviadas para{' '}
              <a href="mailto:contato@gandra.tech">contato@gandra.tech</a>. Poderemos
              solicitar informações razoáveis para confirmar a identidade do solicitante e
              proteger os dados contra acesso indevido.
            </p>
          </section>

          <section aria-labelledby="privacidade-retencao">
            <h2 id="privacidade-retencao">8. Retenção</h2>
            <p>
              O conteúdo de contatos comerciais será mantido apenas pelo tempo necessário para
              atender à solicitação, dar continuidade à conversa e cumprir obrigações legais ou
              preservar direitos. A duração concreta pode variar conforme a conversa, a relação
              comercial e exigências legais. Depois desse período, os dados devem ser excluídos
              ou anonimizados quando aplicável; pedidos de eliminação podem ser encaminhados
              pelo canal de privacidade.
            </p>
          </section>

          <section aria-labelledby="privacidade-seguranca">
            <h2 id="privacidade-seguranca">9. Segurança</h2>
            <p>
              São adotadas medidas técnicas básicas compatíveis com um site institucional, como
              conexão HTTPS no ambiente de hospedagem, headers de segurança, atualização de
              dependências e limitação da coleta. Nenhuma medida elimina completamente riscos, por
              isso incidentes ou alterações relevantes devem ser avaliados e tratados de forma
              adequada.
            </p>
          </section>

          <section aria-labelledby="privacidade-alteracoes">
            <h2 id="privacidade-alteracoes">10. Alterações da política</h2>
            <p>
              Esta política pode ser atualizada para refletir mudanças no site, na infraestrutura,
              nas integrações ou na legislação. A data da última atualização ficará indicada no
              início do documento.
            </p>
          </section>

          <section aria-labelledby="privacidade-contato">
            <h2 id="privacidade-contato">11. Canal de privacidade</h2>
            <p>
              Para dúvidas, solicitações de titulares ou assuntos relacionados à privacidade,
              entre em contato pelo email{' '}
              <a href="mailto:contato@gandra.tech">contato@gandra.tech</a>. Este canal
              funciona como canal de privacidade enquanto não houver outro canal formalmente
              divulgado.
            </p>
          </section>
        </LegalContainer>
      </main>
      <Footer />
    </>
  )
}
