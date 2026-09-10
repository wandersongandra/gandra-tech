'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '@/lib/projects'
import WordReveal from '@/components/motion/WordReveal'
import FadeIn from '@/components/motion/FadeIn'
import PageTransition from '@/components/motion/PageTransition'
import ImageFill from '@/components/motion/ImageFill'
import ScrambleText from '@/components/motion/ScrambleText'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectView({ project, next }: { project: Project; next: Project }) {
  useEffect(() => {
    if (
      window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches
    ) return

    const img = document.querySelector('.pv-hero__cover img')
    if (!img) return

    const tween = gsap.fromTo(img, { scale: 1 }, {
      scale: 1.18,
      ease: 'none',
      scrollTrigger: { trigger: '.pv-hero', start: 'top top', end: 'bottom top', scrub: true },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <PageTransition>
      <section className="pv-hero">
        <div className="container">
          <FadeIn as="div" className="pv-hero__meta" trigger="load" y={12} duration={0.5}>
            <span>{project.category}</span>
            <span>{project.year}</span>
          </FadeIn>
          <WordReveal
            as="h1"
            className="pv-hero__title"
            trigger="load"
            y={44}
            blur={12}
            stagger={0.07}
            duration={0.95}
          >
            {project.headline}
          </WordReveal>
        </div>

        <FadeIn as="div" className="pv-hero__cover" trigger="load" delay={0.4} y={32} duration={0.9}>
          <ImageFill
            src={`/images/projects/${project.slug}/cover.png`}
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
        </FadeIn>
      </section>

      <section className="pv-overview">
        <div className="container">
          <div className="pv-overview__grid">
            <div className="pv-overview__left">
              <div className="pv-overview__label">VISÃO GERAL</div>
              <p className="pv-overview__text">{project.overview}</p>
            </div>
            <div className="pv-overview__right">
              <div className="pv-overview__label">SERVIÇOS</div>
              <ul className="pv-overview__services">
                {project.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
              <div className="pv-overview__label" style={{ marginTop: 40 }}>ANO</div>
              <p className="pv-overview__year">{project.year}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pv-content">
        <div className="container">
          <div className="pv-block pv-block--wide">
            <ImageFill
              src={`/images/projects/${project.slug}/main.png`}
              alt={`Tela principal — ${project.name}`}
              sizes="(min-width: 1200px) 1104px, 100vw"
              quality={95}
              fallback={
                <div className="pv-block__fill">
                  <span className="placeholder-label">tela principal — {project.name}</span>
                </div>
              }
            />
          </div>
        </div>
      </section>

      <section className="pv-next">
        <div className="container">
          <div className="pv-next__label">PRÓXIMO PROJETO</div>
          <Link href={`/trabalhos/${next.slug}`} className="pv-next__link">
            <span className="pv-next__name">
              <ScrambleText text={next.name} trigger="hover" speed={1.4} />
            </span>
            <span className="pv-next__arrow">↗</span>
          </Link>
          <div className="pv-next__category">{next.category} · {next.year}</div>
        </div>
      </section>
    </PageTransition>
  )
}
