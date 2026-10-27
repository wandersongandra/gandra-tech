import Link from 'next/link'
import type { CSSProperties } from 'react'
import { projects, type Project } from '@/lib/projects'
import { getMedia, type MediaInfo } from '@/lib/media'
import { contactEmail, contactMailto } from '@/lib/site'
import { getService, type Service } from '@/lib/services'
import SplitWords from '@/components/materia/SplitWords'
import Picture from '@/components/materia/Picture'
import ScrubText from '@/components/materia/ScrubText'
import PageTransition from '@/components/motion/PageTransition'
import MagneticButton from '@/components/motion/MagneticButton'
import CaseMotion from '@/components/motion/CaseMotion'
import InkTrail from '@/components/motion/InkTrail'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Como a capa entra no hero:
 * - 'stage': foto de estúdio ou interface em fundo escuro — palco na cor do
 *   próprio fundo da imagem, imagem inteira (sem corte) e o nome do projeto
 *   gigante atrás, em outra camada de parallax.
 * - 'bleed': fotografia de ambiente — sangra a largura toda, recortada pelo
 *   ponto focal da direção de arte.
 */
function plateLayout(info: MediaInfo | undefined): 'stage' | 'bleed' {
  if (!info) return 'bleed'
  return info.tone === 'dark' || info.kind === 'ui' || info.orientation === 'portrait' ? 'stage' : 'bleed'
}

/** Imagem de fundo do "próximo case" dentro das letras (AVIF com fallback WebP). */
function nextImageStyle(src: string): CSSProperties {
  const info = getMedia(src)
  if (!info) return {}
  const w = [...info.widths].reverse().find((width) => width <= 1100) ?? info.widths[0]
  return {
    '--next-img': `image-set(url("${info.base}-${w}.avif") type("image/avif"), url("${info.base}-${w}.webp") type("image/webp"))`,
    '--next-pos': info.focus ?? '50% 50%',
  } as CSSProperties
}

export default function ProjectView({ project, next }: { project: Project; next: Project }) {
  const relatedServices = project.relatedServiceSlugs
    .map((slug) => getService(slug))
    .filter((service): service is Service => Boolean(service))
  const index = projects.findIndex((p) => p.slug === project.slug)
  const nextIndex = projects.findIndex((p) => p.slug === next.slug)
  const total = projects.length

  const cover = getMedia(project.coverImage)
  const layout = plateLayout(cover)
  const headlineWords = project.headline.replace(/[.!?]+$/, '').split(' ')
  const accentWord = headlineWords[headlineWords.length - 1]

  const chapters = [
    { title: 'Contexto', text: project.contexto },
    { title: 'Desafio', text: project.desafio },
    { title: 'Solução', text: project.solucao },
    { title: 'Resultado', text: project.resultado },
    { title: 'Papel da Gandra', text: project.papel },
  ]

  const shots = [
    { src: project.mainImage, alt: `Imagem principal do projeto ${project.name}`, caption: undefined as string | undefined },
    ...project.gallery,
  ]

  return (
    <PageTransition>
      <article className="m-case" data-case-root>
        {/* --- Abertura ------------------------------------------------- */}
        <header className="m-case__hero m-shell">
          <div className="m-case__meta mono">
            <span>
              Case {pad(index + 1)}
              <span className="m-case__meta-dim">/{pad(total)}</span>
            </span>
            <span>{project.category}</span>
            <span>{project.year}</span>
            {project.phase ? <span>{project.phase}</span> : null}
          </div>
          <div className="m-case__hero-grid">
            <div>
              <p className="m-case__client">{project.name}</p>
              <SplitWords
                as="h1"
                text={project.headline}
                className="m-case__title"
                accent={[accentWord]}
                step={0.05}
              />
            </div>
            <p className="m-case__lead">{project.overview}</p>
          </div>
        </header>

        <figure
          className={`m-case__plate m-case__plate--${layout}${cover?.orientation === 'portrait' ? ' is-portrait' : ''}`}
          style={{ '--plate-bg': cover?.bg ?? 'var(--m-ink)', '--plate-ratio': cover ? cover.ratio.toFixed(4) : '1.6' } as CSSProperties}
          data-plate
        >
          {layout === 'stage' ? (
            <span
              className="m-case__ghost"
              aria-hidden="true"
              data-depth="-0.18"
              style={{ '--chars': project.name.length } as CSSProperties}
            >
              {project.name}
            </span>
          ) : null}
          <div className="m-case__plate-img" data-depth={layout === 'stage' ? '0.06' : '0.12'}>
            <Picture
              src={project.coverImage}
              alt={`${project.name} — capa do projeto`}
              sizes={layout === 'stage' ? (cover?.orientation === 'portrait' ? '(min-width: 768px) 40vw, 80vw' : '(min-width: 1680px) 1500px, 92vw') : '100vw'}
              fit={layout === 'stage' ? 'contain' : 'cover'}
              priority
              className="m-case__plate-pic"
            />
          </div>
          <figcaption className="m-case__plate-cap mono">
            <span>Fig. 01 — capa</span>
            {cover ? (
              <span>
                {cover.width}×{cover.height}
              </span>
            ) : null}
          </figcaption>
        </figure>

        {/* --- Ficha técnica (carimbo de desenho técnico) ---------------- */}
        <section className="m-case__sheet m-shell" aria-labelledby="case-sheet-title">
          <h2 id="case-sheet-title" className="m-label">
            Ficha técnica
          </h2>
          <dl className="m-case__sheet-grid">
            <div>
              <dt className="mono">Projeto</dt>
              <dd>{project.name}</dd>
            </div>
            <div>
              <dt className="mono">Categoria</dt>
              <dd>{project.category}</dd>
            </div>
            <div>
              <dt className="mono">Ano</dt>
              <dd>{project.year}</dd>
            </div>
            {project.phase ? (
              <div>
                <dt className="mono">Fase</dt>
                <dd>{project.phase}</dd>
              </div>
            ) : null}
            {project.stack ? (
              <div className="m-case__sheet-wide">
                <dt className="mono">Stack</dt>
                <dd>{project.stack}</dd>
              </div>
            ) : null}
            <div className="m-case__sheet-wide">
              <dt className="mono">Serviços</dt>
              <dd>
                <ul className="m-case__services">
                  {relatedServices.map((service) => (
                    <li key={service.slug}>
                      <Link href={`/servicos/${service.slug}`} prefetch={false} className="m-link">
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            {project.externalUrl && project.externalLabel ? (
              <div className="m-case__sheet-wide">
                <dt className="mono">Site do projeto</dt>
                <dd>
                  <a className="m-link" href={project.externalUrl} target="_blank" rel="noopener noreferrer">
                    {project.externalLabel} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        {/* --- Narrativa: o texto acende conforme a leitura -------------- */}
        <section className="m-case__story m-shell" aria-label="Narrativa do projeto">
          {chapters.map((chapter, i) => (
            <div className="m-case__chapter" key={chapter.title}>
              <div className="m-case__chapter-head">
                <span className="m-case__chapter-num" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <h2 className="m-case__chapter-title mono">{chapter.title}</h2>
              </div>
              <ScrubText text={chapter.text} className="m-case__chapter-text" />
            </div>
          ))}
        </section>

        {/* --- Decisões de projeto -------------------------------------- */}
        <section className="m-case__decisions m-shell" aria-labelledby="case-decisions-title">
          <div className="m-case__head">
            <span className="m-label">Decisões de projeto</span>
            <h2 id="case-decisions-title" className="m-case__h2">
              Como a solução foi <span className="m-italic">estruturada.</span>
            </h2>
          </div>
          <ol className="m-case__decision-list">
            {project.details.map((detail, i) => (
              <li className="m-case__decision" key={detail.title}>
                <span className="m-case__decision-num" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <h3 className="m-case__decision-title">{detail.title}</h3>
                <p className="m-case__decision-text">{detail.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* --- Registro visual: cada imagem na própria proporção --------- */}
        <section className="m-case__gallery m-shell" aria-labelledby="case-gallery-title">
          <div className="m-case__gallery-head">
            <h2 id="case-gallery-title" className="m-label">
              Registro visual
            </h2>
            <span className="m-label">{project.name}</span>
          </div>
          <div className="m-case__shots">
            {shots.map((shot, i) => {
              const info = getMedia(shot.src)
              const portrait = info?.orientation === 'portrait'
              return (
                <figure
                  key={`${shot.src}-${i}`}
                  className={`m-case__shot${portrait ? ' is-portrait' : ''}${i === 0 ? ' is-feature' : ''}`}
                  style={{ '--shot-ratio': info ? info.ratio.toFixed(4) : '1.333', '--shot-bg': info?.bg ?? 'var(--m-paper-2)' } as CSSProperties}
                >
                  <div className="m-case__shot-frame" data-reveal>
                    <Picture
                      src={shot.src}
                      alt={shot.alt}
                      sizes={i === 0 ? (portrait ? '(min-width: 900px) 36vw, 92vw' : '(min-width: 900px) 58vw, 92vw') : portrait ? '(min-width: 900px) 36vw, 92vw' : '(min-width: 900px) 40vw, 92vw'}
                      fit="cover"
                      className="m-case__shot-pic"
                    />
                  </div>
                  <figcaption className="m-case__shot-cap mono">
                    <span>Fig. {pad(i + 2)}</span>
                    {shot.caption ? <span>{shot.caption}</span> : null}
                  </figcaption>
                </figure>
              )
            })}
          </div>
          {project.visualNote ? <p className="m-case__note">{project.visualNote}</p> : null}
        </section>

        {/* --- Final em tinta: rastro de nanquim sob o cursor ------------ */}
        <section className="m-case__finale" aria-labelledby="case-finale-title">
          <InkTrail />
          <div className="m-shell m-case__finale-inner">
            <span className="m-label">Tem um projeto em mente?</span>
            <h2 id="case-finale-title" className="m-case__finale-title">
              Vamos desenhar o <span className="m-italic">próximo.</span>
            </h2>
            <div className="m-case__finale-actions">
              <MagneticButton>
                <a href={contactMailto} className="m-button m-button--solid">
                  <span className="m-button__label">Solicitar orçamento</span>
                  <span className="m-button__icon" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </MagneticButton>
              <a href={contactMailto} className="m-link m-case__finale-mail">
                {contactEmail}
              </a>
            </div>
          </div>
        </section>

        {/* --- Próximo case: a foto aparece dentro das letras ------------ */}
        <Link
          href={`/trabalhos/${next.slug}`}
          prefetch={false}
          className="m-case__next"
          style={nextImageStyle(next.workImage)}
          data-curtain={next.name}
          data-cursor="Próximo"
        >
          <span className="m-case__next-label mono">
            Próximo case — {pad(nextIndex + 1)}/{pad(total)}
          </span>
          <span className="m-case__next-name">{next.name}</span>
          <span className="m-case__next-meta mono">
            {next.category} · {next.year} <span aria-hidden="true">→</span>
          </span>
        </Link>
        <CaseMotion />
      </article>
    </PageTransition>
  )
}
