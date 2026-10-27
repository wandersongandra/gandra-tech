'use client'
import { useEffect, useRef } from 'react'
import { projects } from '@/lib/projects'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { withGsap } from '@/lib/gsap'

/**
 * Faixa com os clientes reais do portfólio (lib/projects). O trilho roda em
 * CSS; a velocidade e o sentido seguem o scroll (GSAP só ajusta o
 * playbackRate da animação CSS e uma leve inclinação). Para leitores de
 * tela existe uma lista única e estática; o trilho repetido é decorativo.
 */
export default function ClientMarquee() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { ready, reduced } = useMotionPrefs()

  useEffect(() => withGsap(({ gsap, ScrollTrigger }) => {
    const track = trackRef.current
    if (!track || !ready || reduced) return
    const animation = track.getAnimations()[0]
    if (!animation) return
    let direction = 1
    let settle: gsap.core.Tween | null = null
    const proxy = { rate: 1, skew: 0 }
    const apply = () => {
      animation.playbackRate = proxy.rate * direction
      track.style.setProperty('--skew', `${proxy.skew.toFixed(2)}deg`)
    }
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        direction = self.direction
        const v = Math.min(Math.abs(self.getVelocity()) / 400, 5)
        proxy.rate = 1 + v
        proxy.skew = Math.max(-6, Math.min(6, self.getVelocity() / -300))
        apply()
        settle?.kill()
        settle = gsap.to(proxy, { rate: 1, skew: 0, duration: 0.9, ease: 'power3.out', onUpdate: apply })
      },
    })
    return () => {
      st.kill()
      settle?.kill()
      animation.playbackRate = 1
    }
  }), [ready, reduced])

  const names = projects.map((project) => project.name)
  const run = [...names, ...names]

  return (
    <section className="m-clients" aria-labelledby="clients-title">
      <div className="m-clients__head mono">
        <h2 id="clients-title" className="m-clients__title">Projetos publicados</h2>
        <span aria-hidden="true">({String(names.length).padStart(2, '0')})</span>
      </div>
      <ul className="sr-only">
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <div className="m-clients__viewport" aria-hidden="true">
        <div ref={trackRef} className="m-clients__track">
          {[0, 1].map((copy) => (
            <div className="m-clients__group" key={copy}>
              {run.map((name, index) => (
                <span className="m-clients__item" key={`${copy}-${index}`}>
                  <span className={index % 2 ? 'm-clients__name m-clients__name--italic' : 'm-clients__name'}>{name}</span>
                  <span className="m-clients__star">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
