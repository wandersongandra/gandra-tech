'use client'
import { useEffect, useRef } from 'react'
import { withGsap } from '@/lib/gsap'

/**
 * Cursor de estúdio. O cursor nativo continua sempre visível (a versão
 * anterior o escondia sem colocar nada no lugar). Este componente só
 * acrescenta uma etiqueta que acompanha o ponteiro sobre elementos com
 * [data-cursor], ex.: "Ver case". Ponteiro fino e movimento liberado
 * apenas; em toque ou movimento reduzido não renderiza efeito algum.
 */
export default function StudioCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => withGsap(({ gsap }) => {
    const el = ref.current
    const label = labelRef.current
    if (!el || !label) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })
    let current: Element | null = null

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      xTo(e.clientX)
      yTo(e.clientY)
      const target = (e.target as Element | null)?.closest?.('[data-cursor]') ?? null
      if (target !== current) {
        current = target
        const text = target?.getAttribute('data-cursor') ?? ''
        if (text) label.textContent = text
        el.classList.toggle('is-active', Boolean(text))
      }
    }
    const onLeave = () => {
      current = null
      el.classList.remove('is-active')
    }
    const onDown = () => el.classList.add('is-pressed')
    const onUp = () => el.classList.remove('is-pressed')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    // Ao trocar de rota a etiqueta não fica "presa" no elemento anterior.
    window.addEventListener('gt:curtain-open', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('gt:curtain-open', onLeave)
    }
  }), [])

  return (
    <div ref={ref} className="studio-cursor" aria-hidden="true">
      <span ref={labelRef} className="studio-cursor__label" />
    </div>
  )
}
