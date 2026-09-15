'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WordReveal from '@/components/motion/WordReveal'
import DrawArrow from '@/components/motion/DrawArrow'

gsap.registerPlugin(ScrollTrigger)

const capabilities = [
  {
    title: 'Clareza para comunicar',
    description: 'Sites e portfólios que organizam a mensagem e apresentam o trabalho.',
  },
  {
    title: 'Processos para operar',
    description: 'Sistemas sob medida alinhados às regras e rotinas da empresa.',
  },
  {
    title: 'Produtos para evoluir',
    description: 'Aplicações web construídas para uso recorrente e novas etapas.',
  },
]

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)
  const statementRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const capsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const statement = statementRef.current
    const section = sectionRef.current
    const text = textRef.current
    const caps = capsRef.current
    if (!statement || !section) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(statement, { opacity: 1, y: 0, scale: 1, clearProps: 'transform' })
      if (text) gsap.set(text, { opacity: 1, y: 0, filter: 'none', clearProps: 'transform,filter' })
      if (caps) gsap.set(caps.querySelectorAll('.capability-row'), { opacity: 1, x: 0, clearProps: 'transform' })
      return
    }

    const from = { opacity: 0, y: 32, scale: 0.97 }
    const entryTrigger = ScrollTrigger.create({
      trigger: statement,
      start: 'top 85%',
      onEnter: () =>
        gsap.fromTo(statement, from, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' }),
      onLeaveBack: () => gsap.set(statement, from),
    })

    const parallax = gsap.fromTo(statement, { yPercent: 3 }, {
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
          Produtos digitais que fazem sentido para o negócio.
        </WordReveal>

        <div ref={statementRef} className="manifesto__statement" style={{ opacity: 0 }}>
          <div className="manifesto__statement-head">
            <span>DA IDEIA AO PRODUTO NO AR</span>
            <span>GANDRA / TECH</span>
          </div>
          <p className="manifesto__statement-lead">
            A Gandra Tecnologia transforma objetivos de negócio em sites institucionais,
            portfólios profissionais, sistemas sob medida, automações e aplicações web.
          </p>
          <div className="manifesto__statement-foot">
            <span>CADA PROJETO COMEÇA PELO CONTEXTO</span>
            <span>ATENDIMENTO REMOTO / BRASIL</span>
          </div>
        </div>

        <p ref={textRef} className="manifesto__text">
          Antes de escolher a tecnologia, entendemos o que precisa ser comunicado, simplificado
          ou colocado para funcionar melhor. A solução nasce desse contexto e evolui com o negócio.
        </p>

        <div ref={capsRef} className="manifesto__capabilities">
          {capabilities.map((capability, i) => (
            <div
              key={capability.title}
              className={`capability-row${i === capabilities.length - 1 ? ' capability-row--last' : ''}`}
            >
              <span className="capability-row__index">{String(i + 1).padStart(2, '0')}</span>
              <span className="capability-row__copy">
                <strong>{capability.title}</strong>
                <span>{capability.description}</span>
              </span>
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
