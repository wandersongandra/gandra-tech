'use client'
import { useEffect } from 'react'
import type Lenis from 'lenis'
import { loadGsap } from '@/lib/gsap'

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
    let stUpdate: (() => void) | null = null

    const shouldUseNativeScroll = () =>
      motionQuery.matches || compactQuery.matches || coarseQuery.matches

    const stopLenis = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }

      if (!lenis) return
      if (stUpdate) lenis.off('scroll', stUpdate)
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

      void loadGsap().then(({ ScrollTrigger }) => {
        if (lenis !== instance) return
        stUpdate = ScrollTrigger.update
        instance.on('scroll', stUpdate)
      })

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
