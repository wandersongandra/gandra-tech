'use client'
import { useRef, useEffect } from 'react'

/**
 * Fio condutor: uma linha orgânica serpenteia pela lateral da página e vai
 * se desenhando conforme o scroll desce — progresso do site como traço.
 * Fica por cima do conteúdo (pointer-events: none), na cor de acento.
 */
export default function ScrollThread() {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const path = pathRef.current
    if (!svg || !path) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const compact = window.matchMedia('(max-width: 767px)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (reduceMotion || compact || coarsePointer) return

    let len = 0

    const build = () => {
      // A altura do traço é a do <main> (pai), não a do documento —
      // medir o documento faria o SVG vazar além do rodapé.
      const parent = svg.parentElement
      const h = parent ? parent.scrollHeight : document.documentElement.scrollHeight
      const w = window.innerWidth
      // Lateral esquerda no desktop, direita no mobile.
      const x = w < 768 ? w * 0.92 : w * 0.05
      const amp = Math.min(56, w * 0.045)

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      svg.style.height = `${h}px`

      let d = `M ${x} -60`
      for (let y = 0, i = 0; y <= h + 120; y += 120, i++) {
        const dir = i % 2 === 0 ? 1 : -1
        d += ` C ${x + dir * amp} ${y + 40}, ${x + dir * amp} ${y + 80}, ${x} ${y + 120}`
      }
      path.setAttribute('d', d)

      len = path.getTotalLength()
      path.style.strokeDasharray = `${len}`
    }

    const draw = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      path.style.strokeDashoffset = `${len * (1 - p)}`
    }

    build()
    draw()
    window.addEventListener('resize', build)
    window.addEventListener('scroll', draw, { passive: true })
    // Alturas mudam quando fontes carregam — reconstrói o traço.
    document.fonts?.ready.then(() => {
      build()
      draw()
    })

    return () => {
      window.removeEventListener('resize', build)
      window.removeEventListener('scroll', draw)
    }
  }, [])

  return (
    <svg ref={svgRef} className="scroll-thread" aria-hidden="true" focusable="false">
      <path ref={pathRef} fill="none" />
    </svg>
  )
}
