'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const useNativeScroll = window.matchMedia(
      '(max-width: 767px), (pointer: coarse), (prefers-reduced-motion: reduce)'
    ).matches

    if (useNativeScroll) {
      ;(window as any).__lenis = undefined
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    ;(window as any).__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)

    let rafId = 0
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      ;(window as any).__lenis = undefined
    }
  }, [])

  return <>{children}</>
}
