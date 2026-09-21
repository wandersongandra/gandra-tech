'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WordReveal from '@/components/motion/WordReveal'
import FadeIn from '@/components/motion/FadeIn'
import HeroParticles from '@/components/motion/HeroParticles'
import HeroBlob from '@/components/motion/HeroBlob'
import { getReducedMotionQuery } from '@/components/motion/reducedMotion'
import { contactMailto } from '@/lib/site'

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
    const motionQuery = getReducedMotionQuery()
    const compactQuery = window.matchMedia('(max-width: 767px)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')
    let ctx: gsap.Context | null = null
    let removeHoverListeners: (() => void) | null = null

    const setFinal = () => {
      ctx?.revert()
      ctx = null
      removeHoverListeners?.()
      removeHoverListeners = null
      gsap.killTweensOf([line, center, titleWrap])
      gsap.set(line, { scaleX: 1, clearProps: 'transform' })
      gsap.set(center, { yPercent: 0, clearProps: 'transform' })
      gsap.set(titleWrap, { opacity: 1, x: 0, y: 0, clearProps: 'transform,opacity' })
    }

    const setup = () => {
      setFinal()
      if (motionQuery.matches || compactQuery.matches || coarseQuery.matches) return

      ctx = gsap.context(() => {
      // Linha inferior: expande da esquerda para a direita
      gsap.fromTo(
        line,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, delay: 0.5, ease: 'power3.inOut' }
      )

      // Scroll: o bloco sobe lentamente e o título perde um pouco de opacidade
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

      // Hover do título: deslocamento sutil de no máximo 3px
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
      removeHoverListeners = () => {
        titleWrap.removeEventListener('mousemove', onMove)
        titleWrap.removeEventListener('mouseleave', onLeave)
      }
      }, section)
    }

    setup()
    motionQuery.addEventListener('change', setup)
    compactQuery.addEventListener('change', setup)
    coarseQuery.addEventListener('change', setup)

    return () => {
      motionQuery.removeEventListener('change', setup)
      compactQuery.removeEventListener('change', setup)
      coarseQuery.removeEventListener('change', setup)
      ctx?.revert()
      removeHoverListeners?.()
    }
  }, [])

  // Herói líquido: cada palavra do título foge do cursor e incha de leve
  // perto dele. Só x/scale — y e rotação pertencem à entrada do WordReveal.
  useEffect(() => {
    const titleWrap = titleWrapRef.current
    if (!titleWrap) return
    const motionQuery = getReducedMotionQuery()
    const compact = window.matchMedia('(max-width: 767px)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (motionQuery.matches || compact || coarsePointer) return

    const words = Array.from(titleWrap.querySelectorAll<HTMLElement>('[data-word]'))
    if (!words.length) return

    const setters = words.map((el) => ({
      el,
      x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }),
      sx: gsap.quickTo(el, 'scaleX', { duration: 0.6, ease: 'power3.out' }),
      sy: gsap.quickTo(el, 'scaleY', { duration: 0.6, ease: 'power3.out' }),
    }))

    const RADIUS = 220
    const onMove = (e: MouseEvent) => {
      for (const it of setters) {
        const r = it.el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy)
        if (d < RADIUS) {
          const f = 1 - d / RADIUS
          it.x(-dx * 0.14 * f)
          it.sx(1 + 0.07 * f)
          it.sy(1 + 0.07 * f)
        } else {
          it.x(0)
          it.sx(1)
          it.sy(1)
        }
      }
    }

    // Espera a entrada do título terminar para não brigar com ela.
    const tid = setTimeout(() => {
      if (!motionQuery.matches) window.addEventListener('mousemove', onMove)
    }, 900)
    const handleMotionChange = () => {
      if (motionQuery.matches) {
        window.removeEventListener('mousemove', onMove)
        for (const it of setters) gsap.set(it.el, { x: 0, scaleX: 1, scaleY: 1, clearProps: 'transform' })
      }
    }
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      clearTimeout(tid)
      motionQuery.removeEventListener('change', handleMotionChange)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <section ref={sectionRef} className="hero stack-card">
      {/* Tudo que encolhe no efeito de cartas vive dentro de hero__inner:
          a seção fica preta full-bleed, então as frestas laterais durante
          o encolhimento não revelam o fundo claro da página. */}
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
              y={18}
              blur={0}
              rotation={0}
              stagger={0.05}
              duration={0.75}
              delay={0}
              animateOpacity={false}
            >
              Sites e sistemas sob medida para negócios que querem evoluir.
            </WordReveal>
          </div>

          <FadeIn
            as="p"
            className="hero__subtitle"
            trigger="load"
            delay={0.08}
            y={10}
            duration={0.55}
            animateOpacity={false}
          >
            Desenvolvimento de sites institucionais, portfólios profissionais, sistemas sob medida,
            automações e aplicações web para empresas e profissionais em todo o Brasil.
          </FadeIn>
          <div className="hero__actions">
            <a href={contactMailto} className="link-arrow hero__cta hero__cta--primary">
              Solicitar orçamento ↗
            </a>
            <a href="#servicos" className="link-arrow hero__cta hero__cta--secondary">
              Ver serviços ↓
            </a>
          </div>
        </div>
      </div>

        <div ref={lineRef} className="hero__line" />
      </div>
    </section>
  )
}
