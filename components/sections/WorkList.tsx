'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjectCard from '@/components/ProjectCard'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { projects } from '@/lib/projects'

gsap.registerPlugin(ScrollTrigger)

/**
 * Trabalhos selecionados. Em telas largas com movimento liberado a seção é
 * fixada (pin) e os cases correm na horizontal conforme o scroll vertical,
 * com revelação por clip-path e parallax interno das imagens reais. Em
 * celular, toque ou movimento reduzido vira uma pilha vertical comum —
 * nenhum conteúdo depende da animação.
 */
export default function WorkList() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const { ready, reduced, wide } = useMotionPrefs()

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track || !ready || reduced) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.project-card', track)

      if (wide) {
        section.classList.add('is-pinned')
        const distance = () => Math.max(0, track.scrollWidth - track.clientWidth)
        const horizontal = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section.querySelector('.m-works__stage'),
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress.toFixed(4)})`
            },
          },
        })

        cards.forEach((card) => {
          const media = card.querySelector('.project-card__media')
          const inner = card.querySelector('.project-card__media-inner')
          if (media) {
            gsap.fromTo(
              media,
              { clipPath: 'inset(12% 18% 12% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: horizontal,
                  start: 'left right',
                  end: 'center center',
                  scrub: true,
                },
              }
            )
          }
          if (inner) {
            gsap.fromTo(
              inner,
              { xPercent: -8 },
              {
                xPercent: 8,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: horizontal,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              }
            )
          }
        })
      } else {
        cards.forEach((card) => {
          const media = card.querySelector('.project-card__media')
          if (!media) return
          gsap.fromTo(
            media,
            { clipPath: 'inset(18% 0% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.1,
              ease: 'expo.out',
              scrollTrigger: { trigger: card, start: 'top 88%', once: true },
            }
          )
        })
      }
    }, section)
    window.dispatchEvent(new Event('gt:works-ready'))

    return () => {
      ctx.revert()
      section.classList.remove('is-pinned')
    }
  }, [ready, reduced, wide])

  return (
    <section id="trabalhos" ref={sectionRef} className="work-list m-works" aria-labelledby="works-title">
      <div className="m-works__stage">
        <div className="m-shell m-works__head">
          <div className="m-section-head mono">
            <span>(02) Trabalhos selecionados</span>
            <span>Cada case reúne contexto, decisões de projeto e registros reais.</span>
            <span className="work-list__aside">
              <span className="work-list__count">({String(projects.length).padStart(2, '0')})</span>
            </span>
          </div>
          <div className="m-works__title-row">
            <h2 id="works-title" className="m-display m-works__title">
              Projetos com <em className="m-italic">direção</em> e código.
            </h2>
            <Link href="/trabalhos" prefetch={false} className="m-link work-list__archive" data-cursor="Arquivo">
              Ver arquivo completo <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div className="m-works__viewport">
          <div ref={trackRef} className="project-grid project-grid--home m-works__track">
            {projects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} total={projects.length} />
            ))}
          </div>
        </div>

        <div className="m-shell m-works__progress" aria-hidden="true">
          <span className="m-works__progress-bar">
            <span ref={progressRef} className="m-works__progress-fill" />
          </span>
        </div>
      </div>
    </section>
  )
}
