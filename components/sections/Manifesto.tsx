'use client'
import { useEffect, useRef } from 'react'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { withGsap } from '@/lib/gsap'

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

const statement =
  'Antes de escolher a tecnologia, entendemos o que precisa ser comunicado, simplificado ou colocado para funcionar melhor. A solução nasce desse contexto e evolui com o negócio.'

/**
 * Manifesto. O texto já está completo e legível no HTML; com movimento
 * liberado as palavras "ganham tinta" conforme o scroll avança (só a cor,
 * nada some do layout) e as capacidades sobem em cascata.
 */
export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)
  const { ready, reduced } = useMotionPrefs()

  useEffect(() => withGsap(({ gsap }) => {
    const section = sectionRef.current
    if (!section || !ready || reduced) return
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('.m-manifesto__word')
      gsap.fromTo(
        words,
        { opacity: 0.42 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: '.m-manifesto__statement',
            start: 'top 80%',
            end: 'bottom 45%',
            scrub: true,
          },
        }
      )
      gsap.from('.m-manifesto__cap', {
        yPercent: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.m-manifesto__caps', start: 'top 85%', once: true },
      })
    }, section)
    return () => ctx.revert()
  }), [ready, reduced])

  return (
    <section ref={sectionRef} className="m-manifesto" aria-labelledby="manifesto-title">
      <div className="m-shell">
        <div className="m-section-head mono">
          <span>(03) Abordagem</span>
          <span>Da ideia ao produto no ar</span>
          <span aria-hidden="true">Atendimento remoto / Brasil</span>
        </div>
        <h2 id="manifesto-title" className="m-manifesto__title mono">
          Produtos digitais que fazem sentido para o negócio.
        </h2>
        <p className="m-manifesto__statement">
          {statement.split(' ').map((word, index) => (
            <span key={`${word}-${index}`} className="m-manifesto__word">
              {word}{' '}
            </span>
          ))}
        </p>
        <ul className="m-manifesto__caps">
          {capabilities.map((capability, index) => (
            <li key={capability.title} className="m-manifesto__cap">
              <span className="m-manifesto__cap-num mono">{String(index + 1).padStart(2, '0')}</span>
              <strong className="m-manifesto__cap-title">{capability.title}</strong>
              <span className="m-manifesto__cap-desc">{capability.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
