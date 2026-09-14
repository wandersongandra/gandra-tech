'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    ;(window as any).__lenis = lenis

    // Mantém o ScrollTrigger em sincronia com o scroll suavizado do Lenis.
    // Sem isso, animações com scrub (hero de vídeo) ficam atrasadas.
    lenis.on('scroll', ScrollTrigger.update)

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      ;(window as Window & { __lenis?: Lenis }).__lenis = undefined
    }
  }, [])

  return <>{children}</>
}
