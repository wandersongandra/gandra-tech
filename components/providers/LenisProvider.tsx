'use client'
import { useEffect } from 'react'
import type Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type LenisGlobal = { __lenis?: Lenis }

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compactQuery = window.matchMedia('(max-width: 767px)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')
    let lenis: Lenis | null = null
    let rafId: number | null = null
    let disposed = false
    let loading = false

    const shouldUseNativeScroll = () =>
      motionQuery.matches || compactQuery.matches || coarseQuery.matches

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

    // Lenis só existe no desktop: o módulo é baixado sob demanda e não entra
    // no JavaScript inicial do celular.
    const startLenis = () => {
      if (shouldUseNativeScroll() || lenis || loading) return
      loading = true
      import('lenis').then(({ default: LenisCtor }) => {
        loading = false
        if (disposed || lenis || shouldUseNativeScroll()) return
        createLenis(LenisCtor)
      }, () => {
        loading = false
      })
    }

    const createLenis = (LenisCtor: typeof Lenis) => {
      const instance = new LenisCtor({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
      lenis = instance

      ;(window as unknown as LenisGlobal).__lenis = instance

      instance.on('scroll', ScrollTrigger.update)

      const raf = (time: number) => {
        if (!lenis) return
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    }

    const syncScrollMode = () => {
      if (shouldUseNativeScroll()) {
        stopLenis()
      } else {
        startLenis()
      }
    }

    syncScrollMode()
    motionQuery.addEventListener('change', syncScrollMode)
    compactQuery.addEventListener('change', syncScrollMode)
    coarseQuery.addEventListener('change', syncScrollMode)

    return () => {
      motionQuery.removeEventListener('change', syncScrollMode)
      compactQuery.removeEventListener('change', syncScrollMode)
      coarseQuery.removeEventListener('change', syncScrollMode)
      disposed = true
      stopLenis()
    }
  }, [])

  return <>{children}</>
}
