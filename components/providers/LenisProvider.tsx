'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | null = null
    let rafId = 0

    const stopRaf = () => {
      cancelAnimationFrame(rafId)
      rafId = 0
    }

    const frame = (time: number) => {
      if (!lenis || document.visibilityState !== 'visible') {
        rafId = 0
        return
      }
      lenis.raf(time)
      rafId = requestAnimationFrame(frame)
    }

    const startRaf = () => {
      if (!lenis || rafId || document.visibilityState !== 'visible') return
      rafId = requestAnimationFrame(frame)
    }

    const destroyLenis = () => {
      stopRaf()
      lenis?.destroy()
      lenis = null
      delete window.__lenis
    }

    const createLenis = () => {
      if (lenis || reducedMotion.matches) return

      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
      window.__lenis = lenis
      lenis.on('scroll', ScrollTrigger.update)
      startRaf()
    }

    const syncMotionPreference = () => {
      if (reducedMotion.matches) destroyLenis()
      else createLenis()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') startRaf()
      else stopRaf()
    }

    createLenis()
    reducedMotion.addEventListener('change', syncMotionPreference)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      reducedMotion.removeEventListener('change', syncMotionPreference)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      destroyLenis()
    }
  }, [])

  return <>{children}</>
}
