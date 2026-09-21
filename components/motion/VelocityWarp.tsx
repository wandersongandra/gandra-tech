'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

/**
 * Envolve o conteúdo da página e o "entalha" sutilmente conforme a
 * velocidade do scroll: rolar rápido inclina, parar relaxa. O skew máximo
 * é pequeno de propósito — o efeito deve ser sentido, não lido como bug.
 *
 * Cortina, cursor e grão ficam FORA deste wrapper (no layout) para não
 * herdarem o transform.
 */
export default function VelocityWarp({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const compact = window.matchMedia('(max-width: 767px)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (reduceMotion || compact || coarsePointer) return

    const skewTo = gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3.out' })

    let lastY = window.scrollY
    let lastT = performance.now()
    let velSmooth = 0

    let raf = requestAnimationFrame(function tick(now) {
      const dt = Math.min((now - lastT) / 1000, 0.05)
      lastT = now

      const y = window.scrollY
      const rawVel = dt > 0 ? (y - lastY) / dt : 0
      lastY = y
      velSmooth += (rawVel - velSmooth) * 0.12

      // ~±0.4deg no máximo: cisalhamento de poucos pixels nas bordas.
      skewTo(gsap.utils.clamp(-0.4, 0.4, (velSmooth / 1000) * 0.45))
      raf = requestAnimationFrame(tick)
    })

    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={ref} className="velocity-warp">
      {children}
    </div>
  )
}
