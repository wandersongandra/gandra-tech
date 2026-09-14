import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LegalContainer from '@/components/LegalContainer'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Termos de Uso',
    description: 'Condições de uso do site institucional da Gandra Tecnologia.',
    path: '/termos-de-uso',
  }),
  robots: { index: false, follow: false },
}

export default function TermosDeUso() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* Modelo base técnico; a validação final por advogado é recomendada antes do uso comercial. */}
        <LegalContainer
          eyebrow="INFORMAÇÕES LEGAIS"
          title="Termos de Uso"
          intro="Regras claras para o acesso ao site institucional e para o contato com a Gandra Tecnologia."
          updatedAt="[DATA DA ÚLTIMA ATUALIZAÇÃO]"
        >
          <section aria-labelledby="termos-aceitacao">
            <h2 id="termos-aceitacao">1. Aceitação dos termos</h2>
            <p>
              Ao acessar ou utilizar este site, você declara que leu e compreendeu estes Termos
              de Uso. Caso não concorde com alguma condição, interrompa o acesso ao site.
            </p>
          </section>

          <section aria-labelledby="termos-servicos">
            <h2 id="termos-servicos">2. Serviços da Gandra Tecnologia</h2>
            <p>
              A Gandra Tecnologia presta serviços de desenvolvimento de software, criação de
              sites institucionais, portfólios e sistemas sob medida. Escopo, prazos, valores,
              responsabilidades e direitos sobre cada trabalho são definidos em contrato ou
              proposta comercial específica.
            </p>
          </section>

          <section aria-labelledby="termos-natureza">
            <h2 id="termos-natureza">3. Natureza institucional do site</h2>
            <p>
              Este site tem finalidade informativa e comercial. Ele apresenta a Gandra Tecnologia,
              seus serviços e projetos autorizados para divulgação. Não há e-commerce, cadastro,
              área de login ou transações financeiras realizadas diretamente pelo site.
            </p>
          </section>

          <section aria-labelledby="termos-propriedade">
            <h2 id="termos-propriedade">4. Propriedade intelectual</h2>
            <p>
              O conteúdo, código, design, textos, elementos visuais e marca presentes neste site
              pertencem à Gandra Tecnologia ou a seus respectivos clientes e titulares, conforme
              os contratos aplicáveis. Nenhum conteúdo pode ser copiado, distribuído, alterado ou
              utilizado comercialmente sem autorização.
            </p>
          </section>

          <section aria-labelledby="termos-uso-adequado">
            <h2 id="termos-uso-adequado">5. Uso adequado do site</h2>
            <p>
              É proibido utilizar o site para praticar scraping abusivo, ataques, tentativa de
              exploração, engenharia reversa, introdução de código malicioso, sobrecarga da
              infraestrutura ou qualquer finalidade ilícita ou que prejudique terceiros.
            </p>
          </section>

          <section aria-labelledby="termos-terceiros">
            <h2 id="termos-terceiros">6. Links para terceiros</h2>
            <p>
              O site pode apresentar links para serviços ou páginas de terceiros. A Gandra
              Tecnologia não controla esses ambientes e não se responsabiliza pelo conteúdo,
              disponibilidade, políticas ou práticas de sites externos. Consulte os termos e as
              políticas de cada terceiro antes de utilizá-los.
            </p>
          </section>

          <section aria-labelledby="termos-responsabilidade">
            <h2 id="termos-responsabilidade">7. Limitação de responsabilidade</h2>
            <p>
              O site é disponibilizado “no estado em que se encontra”, dentro dos limites técnicos
              razoáveis. Embora sejam adotados cuidados para manter as informações e os serviços
              disponíveis, podem ocorrer interrupções, erros, alterações de conteúdo ou
              indisponibilidade de serviços externos.
            </p>
          </section>

          <section aria-labelledby="termos-alteracoes">
            <h2 id="termos-alteracoes">8. Alterações destes termos</h2>
            <p>
              A Gandra Tecnologia pode atualizar estes Termos de Uso a qualquer momento para
              refletir mudanças no site, nos serviços ou na legislação aplicável. A versão
              publicada nesta página será considerada a versão vigente.
            </p>
          </section>

          <section aria-labelledby="termos-legislacao">
            <h2 id="termos-legislacao">9. Legislação aplicável e foro</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito
              o foro da comarca de [FORO DA COMARCA], ressalvadas as hipóteses de competência
              legal obrigatória.
            </p>
            <p>
              Para identificação da empresa, utilize os dados que deverão ser preenchidos antes da
              publicação definitiva: CNPJ [CNPJ DA GANDRA TECNOLOGIA] e endereço [ENDEREÇO
              COMPLETO].
            </p>
          </section>

          <section aria-labelledby="termos-contato">
            <h2 id="termos-contato">10. Dúvidas e contato</h2>
            <p>
              Dúvidas sobre estes termos podem ser encaminhadas para{' '}
              <a href="mailto:contato@gandratech.com">contato@gandratech.com</a>.
            </p>
          </section>
        </LegalContainer>
      </main>
      <Footer />
    </>
  )
}
