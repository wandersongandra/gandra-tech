import KineticWordmark from '@/components/motion/KineticWordmark'
import MagneticButton from '@/components/motion/MagneticButton'
import LocalClock from '@/components/materia/LocalClock'
import SplitWords from '@/components/materia/SplitWords'
import { contactMailto } from '@/lib/site'

/**
 * Hero "Matéria": título editorial revelado por máscara (CSS, sem esperar
 * JS) e, na base, a palavra GANDRA como matéria tipográfica viva — os eixos
 * de largura e peso respondem ao cursor (ver KineticWordmark).
 */
export default function Hero() {
  return (
    <section className="m-hero" aria-labelledby="hero-title">
      <div className="m-hero__meta mono">
        <span className="m-hero__meta-item">(GT—26)</span>
        <span className="m-hero__meta-item">Estúdio de software digital</span>
        <span className="m-hero__meta-item m-hero__meta-item--hide-sm">Atendimento remoto · Brasil</span>
        <LocalClock className="m-hero__meta-item m-hero__meta-item--hide-sm" />
      </div>

      <div className="m-hero__body">
        <SplitWords
          as="h1"
          id="hero-title"
          className="m-hero__title"
          text="Sites e sistemas sob medida para negócios que querem evoluir."
          accent={['evoluir']}
          delay={0.05}
          step={0.045}
        />

        <div className="m-hero__aside">
          <p className="m-hero__lead">
            Desenvolvimento de sites institucionais, portfólios profissionais, sistemas sob medida,
            automações e aplicações web para empresas e profissionais em todo o Brasil.
          </p>
          <div className="m-hero__actions">
            <MagneticButton strength={0.25}>
              <a href={contactMailto} className="m-button m-button--solid">
                <span className="m-button__label" data-text="Solicitar orçamento">Solicitar orçamento</span>
                <span className="m-button__icon" aria-hidden="true">↗</span>
              </a>
            </MagneticButton>
            <a href="#servicos" className="m-link">
              Ver serviços <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>

      <div className="m-hero__mark">
        <KineticWordmark text="GANDRA" className="m-hero__wordmark" />
        <div className="m-hero__mark-foot mono" aria-hidden="true">
          <span>Tech®</span>
          <span className="m-hero__hint">Mova o cursor sobre a palavra</span>
          <span className="m-hero__hint-touch">Toque a palavra</span>
          <span>Código · Interface · Movimento</span>
        </div>
      </div>
    </section>
  )
}
