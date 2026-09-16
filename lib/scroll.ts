/**
 * Scroll suave centralizado: usa a instância global do Lenis quando ela
 * existe e cai para o scroll nativo como fallback. Único lugar que conhece
 * o `window.__lenis` — componentes não devem acessá-lo diretamente.
 */

declare global {
  interface Window {
    __lenis?: { scrollTo: (target: unknown, options?: Record<string, unknown>) => void }
  }
}

/** Distância do topo ao rolar para uma âncora (altura do header fixo). */
const HEADER_OFFSET = -65

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

export function scrollToSection(selector: string) {
  if (window.__lenis) {
    window.__lenis.scrollTo(selector, { offset: HEADER_OFFSET })
  } else {
    document.querySelector(selector)?.scrollIntoView({ behavior: scrollBehavior() })
  }
}

export function scrollToTop() {
  if (window.__lenis) {
    window.__lenis.scrollTo(0)
  } else {
    window.scrollTo({ top: 0, behavior: scrollBehavior() })
  }
}
