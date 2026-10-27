'use client'
import { useEffect } from 'react'
import { scrollToSection } from '@/lib/scroll'
import { withGsap } from '@/lib/gsap'

/**
 * Âncoras vindas de outra página (ex.: /#trabalhos a partir de /servicos).
 * O navegador tenta rolar antes de o GSAP criar o pin da seção de trabalhos,
 * e o espaçador do pin muda a altura da página: o visitante caía no topo.
 * Aqui esperamos o layout final (fontes + ScrollTrigger.refresh) e só então
 * rolamos até a âncora, sem animação.
 */
export default function HashScroll() {
  useEffect(() => withGsap(({ gsap, ScrollTrigger }) => {
    const hash = window.location.hash
    if (!hash || hash.length < 2) return
    let target: Element | null = null
    try {
      target = document.querySelector(hash)
    } catch {
      return
    }
    if (!target) return
    let cancelled = false
    const go = () => {
      if (cancelled) return
      ScrollTrigger.refresh()
      requestAnimationFrame(() => {
        if (!cancelled) scrollToSection(hash, { immediate: true })
      })
    }
    let done = false
    const once = () => {
      if (done) return
      done = true
      if (document.fonts?.status === 'loading') document.fonts.ready.then(go)
      else go()
    }
    // A seção de trabalhos avisa quando o pin existe; sem movimento (ou se o
    // aviso não vier), um tempo-limite curto garante a rolagem.
    window.addEventListener('gt:works-ready', once, { once: true })
    const timer = window.setTimeout(once, 900)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.removeEventListener('gt:works-ready', once)
    }
  }), [])
  return null
}
