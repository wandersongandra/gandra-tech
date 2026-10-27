/**
 * Scroll suave centralizado: usa a instância global do Lenis quando ela
 * existe e cai para o scroll nativo como fallback. Único lugar que conhece
 * o `window.__lenis` — componentes não devem acessá-lo diretamente.
 */

declare global {
  interface Window {
    __lenis?: { scrollTo: (target: unknown, options?: Record<string, unknown>) => void; resize?: () => void }
  }
}

/** Distância do topo ao rolar para uma âncora (altura do header fixo). */
const HEADER_OFFSET = -65

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

export function scrollToSection(selector: string, { immediate = false }: { immediate?: boolean } = {}) {
  if (window.__lenis) {
    // O Lenis mede a altura da página com 250 ms de atraso: logo depois de
    // uma troca de rota ele ainda usa o limite da página anterior e cortava
    // a rolagem (ex.: /#trabalhos vindo do 404 parava em y=776). Remede antes.
    window.__lenis.resize?.()
    window.__lenis.scrollTo(selector, { offset: HEADER_OFFSET, immediate })
  } else {
    const el = document.querySelector(selector)
    if (!el) return
    // Mesmo deslocamento do Lenis: a seção não fica sob o cabeçalho fixo.
    const top = el.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET
    window.scrollTo({ top: Math.max(0, top), behavior: immediate ? 'auto' : scrollBehavior() })
  }
}

export function scrollToTop() {
  if (window.__lenis) {
    window.__lenis.scrollTo(0)
  } else {
    window.scrollTo({ top: 0, behavior: scrollBehavior() })
  }
}

/** Topo imediato, sem animação (troca de página por morph). */
export function jumpToTop() {
  window.__lenis?.resize?.()
  window.__lenis?.scrollTo(0, { immediate: true, force: true })
  // 'instant': o html tem scroll-behavior: smooth e scrollTo(0, 0) animava
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
}
