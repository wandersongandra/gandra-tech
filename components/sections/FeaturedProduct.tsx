'use client'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WordReveal from '@/components/motion/WordReveal'
import FadeIn from '@/components/motion/FadeIn'
import MagneticButton from '@/components/motion/MagneticButton'
import ScrambleText from '@/components/motion/ScrambleText'
import ImageFill from '@/components/motion/ImageFill'
import DrawArrow from '@/components/motion/DrawArrow'
import Dissolve from '@/components/motion/Dissolve'

gsap.registerPlugin(ScrollTrigger)

export default function FeaturedProduct() {
  const sectionRef = useRef<HTMLElement>(null)
  const mockupWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const wrap = mockupWrapRef.current
    if (!section || !wrap) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(wrap, { opacity: 1, y: 0, scale: 1 })
      return
    }

    const compact = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches

    if (compact) {
      const tween = gsap.fromTo(
        wrap,
        { opacity: 0, y: 24, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: wrap,
            start: 'top 90%',
            once: true,
          },
        }
      )

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    }

    const from = { opacity: 0, y: 60, scale: 0.94 }
    const entryTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top 85%',
      onEnter: () =>
        gsap.fromTo(wrap, from, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' }),
      onLeaveBack: () => gsap.set(wrap, from),
    })

    const parallax = gsap.fromTo(wrap, { yPercent: 5 }, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    })

    return () => {
      entryTrigger.kill()
      parallax.scrollTrigger?.kill()
      parallax.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="featured stack-card">
      <div className="container" data-stack-inner>
        <div className="section-label">
          <ScrambleText text="01 / PRODUTO EM DESTAQUE" speed={2} />
          <span>2026</span>
        </div>
        <div className="featured__layout">
          <div className="featured__mockup">
            <div ref={mockupWrapRef} className="featured__mockup-hover" style={{ opacity: 0 }}>
              <div className="featured__mockup-image">
                <Dissolve>
                  <ImageFill
                    src="/images/featured/sgs-panel.png"
                    alt="Screenshot do painel SGS"
                    sizes="(min-width: 1400px) 900px, (min-width: 768px) 60vw, 100vw"
                    quality={95}
                    objectFit="contain"
                    objectPosition="center"
                    priority
                    fallback={<span className="placeholder-label">screenshot do painel SGS</span>}
                  />
                </Dissolve>
              </div>
            </div>
          </div>

          <div className="featured__content">
            <FadeIn as="div" className="featured__kicker" y={20} duration={0.6}>
              SGS — Sistema de Gestão de Segurança
            </FadeIn>
            <WordReveal as="h2" className="featured__title" y={30} blur={10} stagger={0.08} duration={0.8}>
              Toda a operação, um único painel.
            </WordReveal>
            <FadeIn as="p" className="featured__desc" y={24} duration={0.65} delay={0.16}>
              Uma plataforma completa para empresas que precisam centralizar inspeções, APRs,
              permissões de trabalho, auditorias, indicadores e evidências. Desenvolvida para
              aumentar a produtividade, garantir conformidade e reduzir riscos operacionais.
            </FadeIn>
            <div className="featured__link-wrapper">
              <MagneticButton>
                <Link href="/trabalhos/sgs" className="link-arrow featured__cta">
                  Conheça o SGS{' '}
                  <span>
                    <DrawArrow size={14} delay={0.5} />
                  </span>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
