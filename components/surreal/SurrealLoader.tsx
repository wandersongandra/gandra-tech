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
    let started = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const start = () => {
      removeTriggers()
      // Uma interação antes do ocioso (toque durante o carregamento) e o
      // próprio ocioso chamavam start duas vezes: duas camadas de manchas,
      // dois pincéis e um engine que nunca era desmontado.
      if (cancelled || started) return
      started = true
      cancelIdle()
      import('./engine').then((engine) => {
        if (cancelled) return
        engine.paperHour()
        // fase 5: o fólio monta também com reduced-motion (versões paradas)
        const folio = (then: (off: () => void) => void) =>
          import('./folio').then((m) => {
            if (!cancelled) then(m.mountFolio({ fine, reduced }))
          })
        if (reduced) {
          folio((off) => {
            cleanup = off
            document.documentElement.dataset.folio = 'on'
          })
          return
        }
        // espera a cortina/entrada do hero assentarem antes de mexer no DOM
        const offEngine = engine.mount({ fine })
        cleanup = offEngine
        document.documentElement.dataset.surreal = 'on'
        // Fluido de tinta no hero (home): chunk separado, depois do LCP.
        // Atraso ~1,8s após o engine para não disputar boot com prensa/fólio.
        let offFluid: (() => void) | undefined
        if (pathname === '/' || pathname === '') {
          const bootFluid = () => {
            if (cancelled || offFluid) return
            import('./fluid/mount').then((fluid) => {
              if (cancelled) return
              offFluid = fluid.mountFluid({ fine })
              const prev = cleanup
              cleanup = () => {
                offFluid?.()
                prev?.()
              }
            })
          }
          window.setTimeout(bootFluid, 1800)
        }
        // fase 4: a prensa (meio-tom, rolo, pincel, som, modo tinta)
        import('./press').then((press) => {
          if (cancelled) return
          const offPress = press.mountPress({ fine })
          cleanup = () => {
            offFluid?.()
            offPress()
            offEngine()
          }
          document.documentElement.dataset.press = 'on'
          folio((offFolio) => {
            cleanup = () => {
              offFluid?.()
              offFolio()
              offPress()
              offEngine()
            }
            document.documentElement.dataset.folio = 'on'
          })
        })
      })
    }
    const cancelIdle = () => {
      if (!idle) return
      const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
      if (cic) cic(idle)
      else clearTimeout(idle)
      idle = 0
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
      cancelIdle()
      cleanup?.()
      delete document.documentElement.dataset.surreal
      delete document.documentElement.dataset.press
      delete document.documentElement.dataset.folio
      delete document.documentElement.dataset.fluid
    }
  }, [pathname])

  return null
}
