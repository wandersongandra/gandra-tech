import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LegalContainer from '@/components/LegalContainer'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Política de Privacidade',
    description: 'Como a Gandra Tecnologia trata dados no seu site institucional.',
    path: '/politica-de-privacidade',
  }),
  robots: { index: false, follow: false },
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
          updatedAt="[DATA DA ÚLTIMA ATUALIZAÇÃO]"
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
              O controlador é a Gandra Tecnologia, inscrita no CNPJ sob [CNPJ DA GANDRA
              TECNOLOGIA], com endereço em [ENDEREÇO COMPLETO].
            </p>
            <p>
              O canal de privacidade e contato do titular é{' '}
              <a href="mailto:contato@gandra.tech">contato@gandra.tech</a>. O nome do
              encarregado, se houver designação formal, deverá ser preenchido em [NOME DO
              ENCARREGADO, SE APLICÁVEL].
            </p>
          </section>

          <section aria-labelledby="privacidade-dados">
            <h2 id="privacidade-dados">3. Dados coletados</h2>
            <p>
              Atualmente, o site não coleta dados por formulários próprios, cadastros ou área de
              login. O único dado fornecido voluntariamente pelo visitante é o conteúdo do email
              que ele decidir enviar por meio do link{' '}
              <a href="mailto:contato@gandra.tech">contato@gandra.tech</a>.
            </p>
            <p>
              A infraestrutura de hospedagem pode registrar dados técnicos necessários à entrega e
              à segurança do serviço, como endereço IP, User-Agent e cookies estritamente
              necessários, conforme a configuração do provedor utilizado.
              No momento, não há rastreamento comercial ativo no site.
            </p>
          </section>

          <section aria-labelledby="privacidade-finalidades">
            <h2 id="privacidade-finalidades">4. Finalidades do tratamento</h2>
            <ul>
              <li>Responder a contatos e solicitações comerciais enviados voluntariamente.</li>
              <li>Manter a segurança, a disponibilidade e o funcionamento do site.</li>
            </ul>
          </section>

          <section aria-labelledby="privacidade-compartilhamento">
            <h2 id="privacidade-compartilhamento">5. Compartilhamento</h2>
            <p>
              A Gandra Tecnologia não vende dados pessoais. O compartilhamento fica limitado aos
              provedores de infraestrutura necessários para hospedar, entregar e proteger o site,
              sempre conforme os serviços efetivamente utilizados e suas respectivas políticas.
            </p>
          </section>

          <section aria-labelledby="privacidade-cookies">
            <h2 id="privacidade-cookies">6. Cookies</h2>
            <p>
              O site pode utilizar apenas cookies estritamente necessários ao funcionamento ou à
              segurança da infraestrutura. No momento, não há cookies de publicidade, pixels ou
              rastreamento comportamental ativo.
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
              preservar direitos. Depois disso, será excluído ou anonimizado quando tecnicamente
              possível e adequado.
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
