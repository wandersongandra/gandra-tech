'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WordReveal from '@/components/motion/WordReveal'
import FadeIn from '@/components/motion/FadeIn'
import HeroParticles from '@/components/motion/HeroParticles'
import HeroBlob from '@/components/motion/HeroBlob'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const titleWrapRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const center = centerRef.current
    const titleWrap = titleWrapRef.current
    const line = lineRef.current
    if (!section || !center || !titleWrap || !line) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const compact = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleX: 0 },
        { scaleX: 1, duration: compact ? 0.8 : 1.4, delay: compact ? 0.8 : 1.8, ease: 'power3.inOut' }
      )

      // Smartphones keep the entrance motion but avoid scrub/mouse effects.
      if (compact) return

      const scrub = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      scrub.to(center, { yPercent: -20, ease: 'none' }, 0)
      scrub.to(titleWrap, { opacity: 0.12, ease: 'none' }, 0)

      const titleX = gsap.quickTo(titleWrap, 'x', { duration: 0.6, ease: 'power3.out' })
      const titleY = gsap.quickTo(titleWrap, 'y', { duration: 0.6, ease: 'power3.out' })

      const onMove = (e: MouseEvent) => {
        const r = titleWrap.getBoundingClientRect()
        titleX(((e.clientX - (r.left + r.width / 2)) / r.width) * 6)
        titleY(((e.clientY - (r.top + r.height / 2)) / r.height) * 6)
      }
      const onLeave = () => {
        titleX(0)
        titleY(0)
      }

      titleWrap.addEventListener('mousemove', onMove)
      titleWrap.addEventListener('mouseleave', onLeave)
    }, section)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const titleWrap = titleWrapRef.current
    if (!titleWrap) return
    if (
      window.matchMedia(
        '(max-width: 767px), (pointer: coarse), (prefers-reduced-motion: reduce)'
      ).matches
    ) return

    const words = Array.from(titleWrap.querySelectorAll<HTMLElement>('[data-word]'))
    if (!words.length) return

    const setters = words.map((el) => ({
      el,
      x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }),
      sx: gsap.quickTo(el, 'scaleX', { duration: 0.6, ease: 'power3.out' }),
      sy: gsap.quickTo(el, 'scaleY', { duration: 0.6, ease: 'power3.out' }),
    }))

    const radius = 220
    const onMove = (e: MouseEvent) => {
      for (const it of setters) {
        const r = it.el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const distance = Math.hypot(dx, dy)
        if (distance < radius) {
          const force = 1 - distance / radius
          it.x(-dx * 0.14 * force)
          it.sx(1 + 0.07 * force)
          it.sy(1 + 0.07 * force)
        } else {
          it.x(0)
          it.sx(1)
          it.sy(1)
        }
      }
    }

    const tid = setTimeout(() => window.addEventListener('mousemove', onMove), 2200)
    return () => {
      clearTimeout(tid)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <section ref={sectionRef} className="hero stack-card">
      <div data-stack-inner className="hero__inner">
        <HeroBlob />
        <HeroParticles />
        <div className="container hero__container">
          <FadeIn
            as="div"
            className="hero__meta"
            trigger="load"
            y={12}
            duration={0.9}
            delay={0.15}
          >
            <span>GANDRA / TECH</span>
            <span>ESTÚDIO DE SOFTWARE DIGITAL</span>
          </FadeIn>

          <div ref={centerRef} className="hero__center">
            <div ref={titleWrapRef} className="hero__title-wrap">
              <WordReveal
                as="h1"
                className="hero__title"
                trigger="load"
                y={30}
                blur={0}
                rotation={0}
                stagger={0.14}
                duration={1.3}
                delay={0.4}
              >
                Software que transforma negócios.
              </WordReveal>
            </div>

            <FadeIn
              as="p"
              className="hero__subtitle"
              trigger="load"
              delay={1.8}
              y={14}
              duration={1}
            >
              Soluções inteligentes, sistemas corporativos e experiências digitais
              desenvolvidas para empresas que querem evoluir.
            </FadeIn>
          </div>
        </div>

        <div ref={lineRef} className="hero__line" />
      </div>
    </section>
  )
}
