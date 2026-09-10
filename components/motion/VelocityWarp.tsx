'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function VelocityWarp({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return

    const skewTo = gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3.out' })
    let lastY = window.scrollY
    let lastT = performance.now()
    let velocity = 0
    let raf = 0

    const relax = () => {
      velocity *= 0.82
      skewTo(gsap.utils.clamp(-0.4, 0.4, (velocity / 1000) * 0.45))

      if (Math.abs(velocity) < 4) {
        velocity = 0
        skewTo(0)
        raf = 0
        return
      }
      raf = requestAnimationFrame(relax)
    }

    const onScroll = () => {
      const now = performance.now()
      const dt = Math.max((now - lastT) / 1000, 1 / 240)
      const currentY = window.scrollY
      const rawVelocity = (currentY - lastY) / dt

      velocity += (rawVelocity - velocity) * 0.24
      lastY = currentY
      lastT = now
      skewTo(gsap.utils.clamp(-0.4, 0.4, (velocity / 1000) * 0.45))

      if (!raf) raf = requestAnimationFrame(relax)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cancelAnimationFrame(raf)
        raf = 0
        velocity = 0
        skewTo(0)
      } else {
        lastY = window.scrollY
        lastT = performance.now()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      cancelAnimationFrame(raf)
      gsap.killTweensOf(el)
    }
  }, [])

  return (
    <div ref={ref} className="velocity-warp">
      {children}
    </div>
  )
}
