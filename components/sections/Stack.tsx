'use client'
import { useEffect, useRef } from 'react'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { withGsap } from '@/lib/gsap'
import { stackGroups, stackItems } from '@/lib/stack'

const copies = [0, 1] as const

/**
 * Stacks de verdade, logo abaixo da abordagem. Os nomes rodam devagar numa
 * faixa mono; o hover pausa o trilho e acende o nome em laranja. Com
 * prefers-reduced-motion a faixa fica parada e só a primeira sequência
 * permanece visível.
 */
export default function Stack() {
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { ready, reduced } = useMotionPrefs()

  useEffect(() => withGsap(({ gsap, ScrollTrigger }) => {
    const section = sectionRef.current
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!section || !viewport || !track || !ready || reduced) return

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 52,
      ease: 'none',
      repeat: -1,
    })

    let hovered = false
    const pause = () => {
      hovered = true
      tween.pause()
    }
    const resume = () => {
      hovered = false
      tween.play()
    }

    viewport.addEventListener('mouseenter', pause)
    viewport.addEventListener('mouseleave', resume)
    viewport.addEventListener('focusin', pause)
    viewport.addEventListener('focusout', resume)

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        if (hovered) return
        const boost = Math.min(Math.abs(self.getVelocity()) / 420, 2.4)
        tween.timeScale(1 + boost)
        gsap.to(tween, { timeScale: 1, duration: 0.9, ease: 'power3.out', overwrite: true })
      },
    })

    return () => {
      st.kill()
      tween.kill()
      viewport.removeEventListener('mouseenter', pause)
      viewport.removeEventListener('mouseleave', resume)
      viewport.removeEventListener('focusin', pause)
      viewport.removeEventListener('focusout', resume)
    }
  }), [ready, reduced])

  return (
    <section ref={sectionRef} className="m-stack" aria-labelledby="stack-title">
      <div className="m-shell">
        <div className="m-section-head mono">
          <span>(04) Stack</span>
          <span>Só o que já usamos nos projetos</span>
          <span aria-hidden="true">{String(stackItems.length).padStart(2, '0')} tecnologias</span>
        </div>
        <h2 id="stack-title" className="m-display m-stack__title">
          As tecnologias com que <em className="m-italic">construímos.</em>
        </h2>
        <ul className="m-stack__index">
          {stackGroups.map((group) => (
            <li key={group.id} className="m-stack__group">
              <span className="m-stack__group-label mono">{group.label}</span>
              <span className="m-stack__group-items mono">{group.items.join(' · ')}</span>
            </li>
          ))}
        </ul>
      </div>
      <div ref={viewportRef} className="m-stack__viewport">
        <div ref={trackRef} className="m-stack__track">
          {copies.map((copy) => (
            <ul
              className="m-stack__rail"
              key={copy}
              aria-hidden="true"
            >
              {stackItems.map((name) => (
                <li key={`${copy}-${name}`} className="m-stack__item mono">
                  <span className="m-stack__name">{name}</span>
                  <span className="m-stack__sep" aria-hidden="true">/</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
