'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Liga a camada surreal (components/surreal/engine.ts) só depois do `load`
 * e de um momento ocioso — ou na primeira interação, o que vier antes. O
 * módulo é um chunk separado: não entra no JS inicial nem disputa o LCP.
 * Com prefers-reduced-motion nada disso carrega; o tom do papel pela hora
 * do dia vale para todos (é só cor, sem movimento).
 */
export default function SurrealLoader() {
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined
    let idle = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const start = () => {
      removeTriggers()
      if (cancelled) return
      import('./engine').then((engine) => {
        if (cancelled) return
        engine.paperHour()
        if (reduced) return
        // espera a cortina/entrada do hero assentarem antes de mexer no DOM
        const offEngine = engine.mount({ fine })
        cleanup = offEngine
        document.documentElement.dataset.surreal = 'on'
        // fase 4: a prensa (meio-tom, rolo, pincel, som, modo tinta)
        import('./press').then((press) => {
          if (cancelled) return
          const offPress = press.mountPress({ fine })
          cleanup = () => {
            offPress()
            offEngine()
          }
          document.documentElement.dataset.press = 'on'
        })
      })
    }
    const schedule = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      if (ric) idle = ric(start, { timeout: 2500 })
      else idle = window.setTimeout(start, 900)
    }
    const triggers = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    const removeTriggers = () => {
      triggers.forEach((t) => window.removeEventListener(t, start))
      window.removeEventListener('load', schedule)
    }
    triggers.forEach((t) => window.addEventListener(t, start, { once: true, passive: true }))
    // no 404 os dígitos caem já na chegada: a tinta precisa estar pronta
    if (document.querySelector('.nf-play')) start()
    else if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })

    return () => {
      cancelled = true
      removeTriggers()
      const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
      if (cic) cic(idle)
      else clearTimeout(idle)
      cleanup?.()
      delete document.documentElement.dataset.surreal
      delete document.documentElement.dataset.press
    }
  }, [pathname])

  return null
}
