'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WordReveal from '@/components/motion/WordReveal'
import ImageFill from '@/components/motion/ImageFill'
import DrawArrow from '@/components/motion/DrawArrow'

gsap.registerPlugin(ScrollTrigger)

const capabilities = [
  'Estratégia / direção',
  'Experiência / identidade',
  'Engenharia / movimento',
]

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const capsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const photo = photoRef.current
    const section = sectionRef.current
    const text = textRef.current
    const caps = capsRef.current
    if (!photo || !section) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(photo, { opacity: 1, y: 0, scale: 1, clearProps: 'transform' })
      if (text) gsap.set(text, { opacity: 1, y: 0, filter: 'none', clearProps: 'transform,filter' })
      if (caps) gsap.set(caps.querySelectorAll('.capability-row'), { opacity: 1, x: 0, clearProps: 'transform' })
      return
    }

    const from = { opacity: 0, y: 32, scale: 0.97 }
    const entryTrigger = ScrollTrigger.create({
      trigger: photo,
      start: 'top 85%',
      onEnter: () =>
        gsap.fromTo(photo, from, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' }),
      onLeaveBack: () => gsap.set(photo, from),
    })

    const parallax = gsap.fromTo(photo, { yPercent: 3 }, {
      yPercent: -5,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    })

    // Parágrafo entra com desfoque saindo, no mesmo vocabulário do WordReveal.
    const textFrom = { opacity: 0, y: 24, filter: 'blur(8px)' }
    let textTrigger: ScrollTrigger | null = null
    if (text) {
      gsap.set(text, textFrom)
      textTrigger = ScrollTrigger.create({
        trigger: text,
        start: 'top 88%',
        onEnter: () =>
          gsap.to(text, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'filter',
          }),
        onLeaveBack: () => gsap.set(text, textFrom),
      })
    }

    // As linhas de capacidade entram em cascata, cada uma deslizando da
    // esquerda com a seta chegando depois.
    let capsTrigger: ScrollTrigger | null = null
    if (caps) {
      const rows = caps.querySelectorAll<HTMLElement>('.capability-row')
      // Só a posição da seta é animada — a opacidade dela pertence ao
      // :hover do CSS, e dois donos para a mesma propriedade brigam.
      const arrows = caps.querySelectorAll<HTMLElement>('.capability-row__arrow')
      const rowsFrom = { opacity: 0, x: -28 }
      const arrowsFrom = { x: -10 }
      gsap.set(rows, rowsFrom)
      gsap.set(arrows, arrowsFrom)

      capsTrigger = ScrollTrigger.create({
        trigger: caps,
        start: 'top 88%',
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
          tl.to(rows, { opacity: 1, x: 0, duration: 0.7, stagger: 0.12 })
            .to(arrows, { x: 0, duration: 0.5, stagger: 0.12, clearProps: 'transform' }, 0.18)
        },
        onLeaveBack: () => {
          gsap.set(rows, rowsFrom)
          gsap.set(arrows, arrowsFrom)
        },
      })
    }

    // Intensidade progressiva: as palavras do título nascem quase
    // fantasmas e ganham tinta conforme o scroll desce — medidor de
    // intensidade. Só `color`, para não brigar com a entrada do WordReveal.
    const title = section.querySelector('.manifesto__title')
    const words = title?.querySelectorAll('[data-word]')
    let wordsTrigger: ScrollTrigger | null = null
    if (title && words?.length) {
      const tween = gsap.fromTo(
        words,
        { color: 'rgba(17, 17, 17, 0.13)' },
        {
          color: '#111111',
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: title,
            start: 'top 92%',
            end: 'bottom 45%',
            scrub: true,
          },
        }
      )
      wordsTrigger = tween.scrollTrigger ?? null
    }

    return () => {
      entryTrigger.kill()
      parallax.scrollTrigger?.kill()
      textTrigger?.kill()
      capsTrigger?.kill()
      wordsTrigger?.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="manifesto stack-card">
      {/* data-stack-inner: o encolhimento do CardStack acontece só no
          conteúdo — o fundo claro da seção segue full-bleed e não aparece
          fresta cinza (card escurecido) contra a página clara. */}
      <div className="container" data-stack-inner>
        <WordReveal
          as="h2"
          className="manifesto__title"
          y={34}
          blur={10}
          stagger={0.05}
          duration={0.9}
        >
          Design e código são apenas ferramentas de expressão. A sensação é o produto.
        </WordReveal>

        <div ref={photoRef} className="manifesto__photo" style={{ opacity: 0 }}>
          <ImageFill
            src="/images/manifesto/campo.png"
            alt="Composição visual abstrata sobre operação e movimento"
            sizes="(min-width: 640px) 760px, 100vw"
            fallback={
              <div className="manifesto__photo-placeholder">
                <span className="placeholder-label">foto — operação em campo</span>
              </div>
            }
          />
        </div>

        <p ref={textRef} className="manifesto__text">
          Criamos produtos digitais para pessoas que estão indo a algum lugar. Cada interface
          é uma escolha sobre atenção, confiança e movimento. Tornamos essas escolhas visíveis.
        </p>

        <div ref={capsRef} className="manifesto__capabilities">
          {capabilities.map((label, i) => (
            <div
              key={label}
              className={`capability-row${i === capabilities.length - 1 ? ' capability-row--last' : ''}`}
            >
              <span>{label}</span>
              <span className="capability-row__arrow">
                <DrawArrow size={13} delay={0.3 + i * 0.12} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
