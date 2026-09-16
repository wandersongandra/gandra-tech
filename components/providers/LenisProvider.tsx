'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type LenisGlobal = { __lenis?: Lenis }

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | null = null
    let rafId: number | null = null

    const stopLenis = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }

      if (!lenis) return
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      lenis = null
      ;(window as unknown as LenisGlobal).__lenis = undefined
    }

    const startLenis = () => {
      if (motionQuery.matches || lenis) return

      const instance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
      lenis = instance

      ;(window as unknown as LenisGlobal).__lenis = instance

      // Mantém o ScrollTrigger em sincronia com o scroll suavizado do Lenis.
      // Sem isso, animações com scrub ficam atrasadas.
      instance.on('scroll', ScrollTrigger.update)

      const raf = (time: number) => {
        if (!lenis) return
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    }

    const handleMotionChange = () => {
      if (motionQuery.matches) {
        stopLenis()
      } else {
        startLenis()
      }
    }

    handleMotionChange()
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      stopLenis()
    }
  }, [])

  return <>{children}</>
}
