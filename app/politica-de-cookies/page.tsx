import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LegalContainer from '@/components/LegalContainer'
import { createPageMetadata } from '@/lib/seo'
import { leadSubmissionEnabled } from '@/lib/lead-availability'

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Política de Cookies e Armazenamento',
    description: 'Saiba como a Gandra Tecnologia utiliza armazenamento local e recursos de segurança no navegador.',
    path: '/politica-de-cookies',
  }),
  robots: { index: false, follow: false },
  title: { absolute: 'Cookies e Armazenamento — Gandra Tecnologia' },
}

export default function PoliticaDeCookies() {
  return (
    <>
      <Header />
      <main id="main-content">
        <LegalContainer
          eyebrow="INFORMAÇÕES LEGAIS"
          title="Cookies e armazenamento"
          intro="O que o navegador pode guardar ao visitar a Gandra Tecnologia e para que serve cada recurso."
          updatedAt="09/11/2026"
        >
          <section aria-labelledby="cookies-diferenca">
            <h2 id="cookies-diferenca">1. Cookies e armazenamento local</h2>
            <p>
              Cookies são pequenos registros que podem ser enviados entre o navegador e o servidor.
              O site também utiliza <em>localStorage</em> e <em>sessionStorage</em>, recursos do navegador
              que guardam preferências e estados da interface. Esses registros locais não são, por si
              só, cookies transmitidos automaticamente a cada acesso.
            </p>
          </section>

          <section aria-labelledby="cookies-preferencias">
            <h2 id="cookies-preferencias">2. Preferências e funcionamento do site</h2>
            <p>
              Estes registros servem às animações, à acessibilidade e à continuidade da navegação.
              Não guardam nome, e-mail ou conteúdo de pedidos de orçamento.
            </p>
            <ul>
              <li><strong>gt-intro</strong> (localStorage): registra o momento da visita para controlar a reapresentação da abertura animada. A janela de controle é de aproximadamente 30 minutos; o registro pode permanecer até a limpeza dos dados do navegador.</li>
              <li><strong>gt-som</strong> (localStorage): guarda sua escolha de ligar ou desligar os efeitos sonoros, que começam desligados por padrão.</li>
              <li><strong>gt-tinta</strong> (sessionStorage): lembra o modo visual de tinta durante a sessão.</li>
              <li><strong>gt-intro</strong> e <strong>gt-sig</strong> (sessionStorage): evitam repetir partes da apresentação e da assinatura visual na mesma sessão.</li>
              <li><strong>gt-scroll</strong> (sessionStorage): restaura posições de rolagem ao voltar ou avançar entre páginas.</li>
            </ul>
            <p>
              Registros de sessão normalmente são descartados quando a sessão do navegador é encerrada;
              preferências locais podem permanecer até serem alteradas ou apagadas pelo visitante.
            </p>
          </section>

          <section aria-labelledby="cookies-provedores">
            <h2 id="cookies-provedores">3. Infraestrutura, medição e segurança</h2>
            <p>
              A hospedagem e a proteção da Cloudflare podem usar cookies técnicos de segurança,
              por exemplo durante uma verificação automatizada de acesso. A emissão concreta
              depende dos recursos de proteção acionados na visita.
            </p>
            <p>
              O Cloudflare Web Analytics pode carregar um script de medição de desempenho e
              visitas para fornecer estatísticas agregadas. Segundo a documentação do provedor,
              esse serviço não usa dados pessoais dos visitantes para análise individual.
              Não utilizamos pixels publicitários próprios ou cookies para anúncios personalizados.
            </p>
            {leadSubmissionEnabled && (
              <p>
                Na página de orçamento, o Cloudflare Turnstile verifica tentativas de envio para
                reduzir mensagens automatizadas. Essa verificação pode processar informações técnicas
                de segurança; o formulário não ativa pré-liberação de desafios intencionalmente.
              </p>
            )}
          </section>

          <section aria-labelledby="cookies-controle">
            <h2 id="cookies-controle">4. Como controlar esses recursos</h2>
            <p>
              Você pode limpar cookies e dados armazenados do domínio nas configurações do navegador.
              Também pode desligar os efeitos sonoros no próprio site. A exclusão de preferências
              pode fazer a animação de entrada reaparecer ou redefinir o modo de navegação.
            </p>
            <p>
              Não há, no código atual, cookies de publicidade ou categorias opcionais próprias
              que exijam um painel de preferências. Se forem adicionados rastreadores não essenciais,
              será necessária nova avaliação e implementação de escolhas adequadas antes da ativação.
            </p>
          </section>

          <section aria-labelledby="cookies-privacidade">
            <h2 id="cookies-privacidade">5. Privacidade e contato</h2>
            <p>
              Para conhecer as finalidades de tratamento de dados e exercer seus direitos, consulte
              a <Link href="/politica-de-privacidade">Política de Privacidade</Link> ou escreva para{' '}
              <a href="mailto:contato@gandra.tech">contato@gandra.tech</a>.
            </p>
          </section>
        </LegalContainer>
      </main>
      <Footer />
    </>
  )
}
