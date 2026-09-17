'use client'
import WordReveal from '@/components/motion/WordReveal'
import FadeIn from '@/components/motion/FadeIn'
import PageTransition from '@/components/motion/PageTransition'
import CopyEmailButton from '@/components/CopyEmailButton'
import { activeSocialLinks, contactEmail, contactMailto, contactNotes } from '@/lib/site'
import { faqItems } from '@/lib/faq'

export default function ContactPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="cp-hero">
        <div className="container">
          <FadeIn as="div" className="cp-hero__label" trigger="load" y={12} duration={0.5}>
            VAMOS CONVERSAR
          </FadeIn>
          <WordReveal
            as="h1"
            className="cp-hero__title"
            trigger="load"
            y={44}
            blur={12}
            stagger={0.07}
            duration={0.95}
            animateOpacity={false}
          >
            Trabalho bom começa com uma conversa honesta.
          </WordReveal>
          <FadeIn as="p" className="cp-hero__sub" trigger="load" delay={0.3} y={20} duration={0.7} animateOpacity={false}>
            Conta o que você tem em mente. A gente responde com atenção — sem roteiro de vendas,
            sem promessa vazia.
          </FadeIn>
          <FadeIn trigger="load" delay={0.5} y={16} duration={0.7} animateOpacity={false}>
            <a href={contactMailto} className="cp-hero__email">
              {contactEmail} ↗
            </a>
          </FadeIn>
          <CopyEmailButton email={contactEmail} />
        </div>
      </section>

      {/* Info grid */}
      <section className="cp-grid-section">
        <div className="container">
          <div className="cp-grid">

            <div className="cp-grid__col cp-grid__col--main">
              <div className="cp-grid__label">CONTATO DIRETO</div>
              <a href={contactMailto} className="cp-grid__email-link">
                {contactEmail}
              </a>
              {activeSocialLinks.length > 0 && (
                <>
                  <div className="cp-grid__label" style={{ marginTop: 40 }}>REDES</div>
                  <div className="cp-grid__links">
                    {activeSocialLinks.map((item) => (
                      <a
                        key={item.label}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cp-grid__link"
                      >
                        <span className="cp-grid__link-label">{item.label}</span>
                        <span className="cp-grid__link-value">{item.handle} ↗</span>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="cp-grid__col">
              <div className="cp-grid__label">NOTAS</div>
              <div className="cp-grid__notes">
                {contactNotes.map((n) => (
                  <p key={n}>{n}</p>
                ))}
              </div>
            </div>

            <div className="cp-grid__col">
              <div className="cp-grid__label">LOCALIZAÇÃO</div>
              <p className="cp-grid__location">
                Atendimento remoto<br />
                Todo o Brasil
              </p>
              <div className="cp-grid__label" style={{ marginTop: 40 }}>DISPONIBILIDADE</div>
              <p className="cp-grid__location">
                Novos projetos<br />
                sob consulta
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="cp-process" aria-labelledby="cp-process-title">
        <div className="container">
          <div className="cp-process__intro">
            <div className="cp-grid__label">DEPOIS DO PRIMEIRO CONTATO</div>
            <h2 id="cp-process-title">O que acontece depois do contato.</h2>
          </div>
          <ol className="cp-process__steps">
            <li>
              <span>01</span>
              <p>Você envia o contexto e o objetivo do projeto.</p>
            </li>
            <li>
              <span>02</span>
              <p>Retornamos com perguntas de alinhamento de escopo.</p>
            </li>
            <li>
              <span>03</span>
              <p>Você recebe uma proposta com escopo, etapas e investimento.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="cp-faq" aria-labelledby="faq-title">
        <div className="container">
          <div className="cp-faq__intro">
            <div className="cp-grid__label">ANTES DE COMEÇAR</div>
            <h2 id="faq-title">Perguntas frequentes sobre projetos digitais.</h2>
            <p>Estas são as respostas diretas para as dúvidas mais comuns antes do primeiro contato.</p>
          </div>
          <dl className="cp-faq__list">
            {faqItems.map((item) => (
              <div className="cp-faq__item" key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </PageTransition>
  )
}
