'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

/**
 * Envolve o conteúdo da página e o inclina sutilmente conforme a velocidade
 * do scroll. O efeito fica restrito a desktop/fine pointer; em smartphones,
 * scroll nativo sem transform é mais estável e mais barato para a GPU.
 */
export default function VelocityWarp({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (
      window.matchMedia(
        '(max-width: 767px), (pointer: coarse), (prefers-reduced-motion: reduce)'
      ).matches
    ) return

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
