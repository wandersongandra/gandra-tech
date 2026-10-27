'use client'
import { useEffect, useRef } from 'react'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { contactSteps } from '@/lib/process'
import { withGsap } from '@/lib/gsap'

/**
 * O que acontece depois do contato — as mesmas três etapas publicadas em
 * /contato. Uma linha técnica é desenhada pelo scroll e acende cada etapa
 * quando passa por ela.
 */
export default function Process() {
  const sectionRef = useRef<HTMLElement>(null)
  const { ready, reduced } = useMotionPrefs()

  useEffect(() => withGsap(({ gsap, ScrollTrigger }) => {
    const section = sectionRef.current
    if (!section || !ready || reduced) return
    const ctx = gsap.context(() => {
      const list = section.querySelector('.m-process__list')
      gsap.fromTo(
        '.m-process__line-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: true },
        }
      )
      gsap.utils.toArray<HTMLElement>('.m-process__step').forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 62%',
          end: 'bottom 62%',
          toggleClass: { targets: step, className: 'is-lit' },
          onLeave: () => step.classList.add('is-lit'),
        })
        gsap.from(step.querySelector('.m-process__text'), {
          yPercent: 40,
          opacity: 0,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: step, start: 'top 85%', once: true },
        })
      })
    }, section)
    return () => ctx.revert()
  }), [ready, reduced])

  return (
    <section ref={sectionRef} className="m-process" aria-labelledby="process-title">
      <div className="m-shell">
        <div className="m-section-head mono">
          <span>(04) Processo</span>
          <span>Cada projeto começa pelo contexto certo</span>
          <span aria-hidden="true">03 etapas</span>
        </div>
        <div className="m-process__grid">
          <h2 id="process-title" className="m-display m-process__title">
            O que acontece depois do <em className="m-italic">contato.</em>
          </h2>
          <div className="m-process__list">
            <span className="m-process__line" aria-hidden="true">
              <span className="m-process__line-fill" />
            </span>
            <ol className="m-process__steps">
            {contactSteps.map((step, index) => (
              <li key={step} className="m-process__step">
                <span className="m-process__num mono">{String(index + 1).padStart(2, '0')}</span>
                <p className="m-process__text">{step}</p>
              </li>
            ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
