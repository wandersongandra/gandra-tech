'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WordReveal from '@/components/motion/WordReveal'
import FadeIn from '@/components/motion/FadeIn'
import MagneticButton from '@/components/motion/MagneticButton'
import ScrambleText from '@/components/motion/ScrambleText'
import DrawArrow from '@/components/motion/DrawArrow'
import { services } from '@/lib/services'

gsap.registerPlugin(ScrollTrigger)

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const list = listRef.current
    if (!section || !list) return

    const items = list.querySelectorAll<HTMLElement>('.services__item')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { opacity: 1, y: 0, clearProps: 'transform' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: list,
            start: 'top 82%',
            once: true,
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="servicos"
      ref={sectionRef}
      className="services stack-card"
      aria-label="Serviços da Gandra Tecnologia"
    >
      <div className="container" data-stack-inner>
        <div className="section-label">
          <ScrambleText text="01 / SERVIÇOS" speed={2} />
          <span>GANDRA / TECH</span>
        </div>

        <div className="services__intro">
          <div>
            <FadeIn as="div" className="services__kicker" y={18} duration={0.6}>
              Do primeiro rabisco ao produto no ar
            </FadeIn>
              <WordReveal
              as="h2"
              className="services__title"
              y={30}
              blur={10}
              stagger={0.07}
              duration={0.8}
            >
              Sites, sistemas e aplicações web para colocar negócios em movimento.
            </WordReveal>
          </div>
          <FadeIn as="p" className="services__desc" y={24} duration={0.65} delay={0.16}>
            A Gandra Tecnologia desenvolve sites institucionais, portfólios profissionais,
            sistemas sob medida e aplicações web para empresas e profissionais em todo o Brasil.
          </FadeIn>
        </div>

        <ul ref={listRef} className="services__list">
          {services.map((service, index) => (
            <li key={service.title} className="services__item">
              <Link href={`/servicos#${service.slug}`} prefetch={false} className="services__item-link">
                <span className="services__index">{String(index + 1).padStart(2, '0')}</span>
                <div className="services__item-copy">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <span className="services__item-arrow" aria-hidden="true">
                  <DrawArrow size={14} delay={0.25 + index * 0.08} />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="services__footer">
          <FadeIn as="p" className="services__footnote" y={18} duration={0.6}>
            Precisa tirar um projeto do papel?
          </FadeIn>
          <div className="services__cta-group">
            <Link href="/servicos" prefetch={false} className="link-arrow services__cta">
              Conheça cada serviço{' '}
              <span>
                <DrawArrow size={14} delay={0.5} />
              </span>
            </Link>
            <MagneticButton>
              <Link href="/contato" prefetch={false} className="link-arrow services__cta">
                Vamos conversar{' '}
                <span>
                  <DrawArrow size={14} delay={0.6} />
                </span>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
