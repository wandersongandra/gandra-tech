'use client'
import Link from 'next/link'
import type { Project } from '@/lib/projects'
import WordReveal from '@/components/motion/WordReveal'
import FadeIn from '@/components/motion/FadeIn'
import PageTransition from '@/components/motion/PageTransition'
import ImageFill from '@/components/motion/ImageFill'
import { contactMailto } from '@/lib/site'
import { getService, type Service } from '@/lib/services'

export default function ProjectView({ project, next }: { project: Project; next: Project }) {
  const relatedServices = project.relatedServiceSlugs
    .map((slug) => getService(slug))
    .filter((service): service is Service => Boolean(service))

  return (
    <PageTransition>
      {/* Hero */}
      <section className="pv-hero">
        <div className="container">
          <FadeIn as="div" className="pv-hero__meta" trigger="load" y={12} duration={0.5}>
            <span>{project.category}</span>
            <span>{project.year}</span>
            {project.phase && <span>{project.phase}</span>}
          </FadeIn>
          <WordReveal
            as="h1"
            className="pv-hero__title"
            trigger="load"
            y={44}
            blur={12}
            stagger={0.045}
            duration={0.65}
            animateOpacity={false}
          >
            {project.headline}
          </WordReveal>
        </div>

        <div className="pv-hero__cover">
          <ImageFill
            src={project.coverImage}
            alt={`${project.name} — capa do projeto`}
            sizes="100vw"
            quality={95}
            priority
            fallback={
              <div className="pv-hero__cover-fill">
                <span className="placeholder-label">{project.name} — capa do projeto</span>
              </div>
            }
          />
        </div>
      </section>

      {/* Overview */}
      <section className="pv-overview">
        <div className="container">
          <div className="pv-overview__grid">
            <div className="pv-overview__left">
              <div className="pv-overview__block">
                <div className="pv-overview__label">CONTEXTO</div>
                <p className="pv-overview__text">{project.contexto}</p>
              </div>
              <div className="pv-overview__block">
                <div className="pv-overview__label">DESAFIO</div>
                <p className="pv-overview__text">{project.desafio}</p>
              </div>
              <div className="pv-overview__block">
                <div className="pv-overview__label">SOLUÇÃO</div>
                <p className="pv-overview__text">{project.solucao}</p>
              </div>
            </div>
            <div className="pv-overview__right">
              <div className="pv-overview__block">
                <div className="pv-overview__label">RESULTADO</div>
                <p className="pv-overview__text">{project.resultado}</p>
              </div>
              <div className="pv-overview__block">
                <div className="pv-overview__label">PAPEL DA GANDRA</div>
                <p className="pv-overview__text">{project.papel}</p>
              </div>
              {project.externalUrl && project.externalLabel && (
                <div className="pv-overview__block">
                  <div className="pv-overview__label">SITE DO PROJETO</div>
                  <a className="pv-overview__external" href={project.externalUrl} target="_blank" rel="noopener noreferrer">
                    {project.externalLabel} ↗
                  </a>
                </div>
              )}
              {project.stack && (
                <div className="pv-overview__block">
                  <div className="pv-overview__label">STACK</div>
                  <p className="pv-overview__text">{project.stack}</p>
                </div>
              )}
              <div className="pv-overview__label">SERVIÇOS</div>
              <ul className="pv-overview__services">
                {relatedServices.map((service) => (
                  <li key={service.slug}>
                    <Link href={`/servicos/${service.slug}`} prefetch={false}>
                      {service.title} ↗
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pv-overview__label" style={{ marginTop: 40 }}>ANO</div>
              <p className="pv-overview__year">{project.year}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pv-details" aria-labelledby="pv-details-title">
        <div className="container">
          <div className="pv-details__heading">
            <div className="pv-overview__label">DECISÕES DE PROJETO</div>
            <h2 id="pv-details-title">Como a solução foi estruturada.</h2>
          </div>
          <div className="pv-details__list">
            {project.details.map((detail, index) => (
              <article className="pv-details__item" key={detail.title}>
                <span className="pv-details__number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{detail.title}</h3>
                  <p>{detail.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pv-gallery" aria-labelledby="pv-gallery-title">
        <div className="container">
          <div className="section-label">
            <span id="pv-gallery-title">REGISTRO VISUAL</span>
            <span>{project.name}</span>
          </div>
          <div className="pv-gallery__grid">
            <figure className="pv-gallery__figure pv-gallery__figure--feature">
              <div className="pv-gallery__image">
                <ImageFill
                  src={project.mainImage}
                  alt={`Imagem principal do projeto ${project.name}`}
                  sizes="(min-width: 1200px) 68vw, 100vw"
                  quality={95}
                  fallback={<div className="pv-block__fill"><span className="placeholder-label">{project.name}</span></div>}
                />
              </div>
            </figure>
            {project.gallery.map((image) => (
              <figure className="pv-gallery__figure" key={image.src}>
                <div className="pv-gallery__image">
                  <ImageFill
                    src={image.src}
                    alt={image.alt}
                    sizes="(min-width: 1200px) 32vw, 100vw"
                    quality={95}
                    fallback={<div className="pv-block__fill"><span className="placeholder-label">{project.name}</span></div>}
                  />
                </div>
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            ))}
          </div>
          {project.visualNote && <p className="pv-content__note">{project.visualNote}</p>}
        </div>
      </section>

      <section className="pv-contact">
        <div className="container">
          <p className="pv-contact__label">TEM UM PROJETO EM MENTE?</p>
          <a href={contactMailto} className="pv-contact__link">
            Vamos conversar sobre o seu próximo projeto ↗
          </a>
          <a href={contactMailto} className="link-arrow pv-contact__cta">
            Solicitar orçamento ↗
          </a>
        </div>
      </section>

      {/* Next project */}
      <section className="pv-next">
        <div className="container">
          <div className="pv-next__label">PRÓXIMO PROJETO</div>
          <Link href={`/trabalhos/${next.slug}`} prefetch={false} className="pv-next__link">
            <span className="pv-next__name">{next.name}</span>
            <span className="pv-next__arrow">↗</span>
          </Link>
          <div className="pv-next__category">{next.category} · {next.year}</div>
        </div>
      </section>
    </PageTransition>
  )
}
