/**
 * GSAP sob demanda. O núcleo (~70 KB) e o ScrollTrigger (~43 KB) saem do
 * JavaScript inicial: cada efeito pede o kit com `withGsap` e roda quando ele
 * chega (na prática, logo depois da hidratação, já com o LCP pintado).
 * Um único import compartilhado; depois do primeiro, a chamada é síncrona.
 */
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

export type GsapKit = {
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof ScrollTriggerType
}

let kit: GsapKit | null = null
let pending: Promise<GsapKit> | null = null

export function loadGsap(): Promise<GsapKit> {
  if (kit) return Promise.resolve(kit)
  if (!pending) {
    pending = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, s]) => {
      g.gsap.registerPlugin(s.ScrollTrigger)
      kit = { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger }
      return kit
    })
  }
  return pending
}

/** Kit já carregado (ou null) — para handlers síncronos. */
export function gsapNow(): GsapKit | null {
  return kit
}

/**
 * Roda `run` com o GSAP assim que ele estiver disponível e devolve a limpeza
 * (cancela se o componente desmontar antes do download terminar).
 */
export function withGsap(run: (k: GsapKit) => void | (() => void)): () => void {
  let cancelled = false
  let cleanup: void | (() => void)
  if (kit) cleanup = run(kit)
  else
    loadGsap().then(
      (k) => {
        if (!cancelled) cleanup = run(k)
      },
      () => {}
    )
  return () => {
    cancelled = true
    if (typeof cleanup === 'function') cleanup()
  }
}
