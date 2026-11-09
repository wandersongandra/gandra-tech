import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LegalContainer from '@/components/LegalContainer'
import { createPageMetadata } from '@/lib/seo'
import { identificacaoLegal } from '@/lib/legal'

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Termos de Uso',
    description: 'Condições de uso do site institucional da Gandra Tecnologia.',
    path: '/termos-de-uso',
  }),
  robots: { index: false, follow: false },
  title: { absolute: 'Termos de Uso — Gandra Tecnologia' },
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
          updatedAt="09/11/2026"
        >
          <section aria-labelledby="termos-aceitacao">
            <h2 id="termos-aceitacao">1. Sobre estes termos</h2>
            <p>
              Estes termos apresentam informações e condições gerais de uso do site institucional.
              A simples visita não representa assinatura de contrato de prestação de serviços
              nem substitui as garantias previstas na legislação aplicável.
            </p>
          </section>

          <section aria-labelledby="termos-servicos">
            <h2 id="termos-servicos">2. Serviços da Gandra Tecnologia</h2>
            <p>
              A Gandra Tecnologia presta serviços de desenvolvimento de software, criação de
              sites institucionais, portfólios, sistemas sob medida, automações e aplicações web.
              Escopo, prazos, valores,
              responsabilidades e direitos sobre cada trabalho são definidos em contrato ou
              proposta comercial específica.
              Enviar uma mensagem ou pedir orçamento não gera cobrança, contratação automática
              ou compromisso de fechar negócio.
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
              A marca, os textos, os elementos visuais e os trabalhos publicados têm titulares
              específicos, inclusive clientes e parceiros, conforme os direitos e contratos
              aplicáveis. Seu uso deve respeitar esses direitos, as autorizações concedidas e as
              exceções legais, inclusive citações e demais usos permitidos pela legislação.
            </p>
          </section>

          <section aria-labelledby="termos-uso-adequado">
            <h2 id="termos-uso-adequado">5. Uso adequado do site</h2>
            <p>
              Não é permitido tentar invadir sistemas, introduzir código malicioso, interromper
              o serviço, sobrecarregar a infraestrutura ou coletar dados de forma ilícita e
              prejudicial a terceiros. Essa regra não restringe usos legítimos, fiscalização,
              pesquisa ou direitos garantidos em lei.
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
              Embora sejam adotados cuidados para manter as informações e os serviços
              disponíveis, podem ocorrer interrupções, erros, alterações de conteúdo ou
              indisponibilidade de serviços externos. Nenhuma disposição desta página afasta
              responsabilidades ou direitos que não possam ser limitados pela legislação brasileira.
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
              Estes termos observam as leis da República Federativa do Brasil. Eventuais
              controvérsias seguirão o foro competente determinado pela legislação aplicável
              e, quando válido, pelo contrato específico firmado entre as partes.
            </p>
            <p>
              {identificacaoLegal}
            </p>
          </section>

          <section aria-labelledby="termos-contato">
            <h2 id="termos-contato">10. Dúvidas e contato</h2>
            <p>
              Dúvidas sobre estes termos podem ser encaminhadas para{' '}
              <a href="mailto:contato@gandra.tech">contato@gandra.tech</a>.
            </p>
          </section>
        </LegalContainer>
      </main>
      <Footer />
    </>
  )
}
