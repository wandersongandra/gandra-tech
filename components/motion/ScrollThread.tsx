'use client'
import { useRef, useEffect } from 'react'

/**
 * Fio condutor da versão desktop. Em telas pequenas ele é omitido para
 * reduzir ruído visual e evitar listeners de scroll sem benefício em touch.
 */
export default function ScrollThread() {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const path = pathRef.current
    if (!svg || !path) return
    if (
      window.matchMedia(
        '(max-width: 767px), (pointer: coarse), (prefers-reduced-motion: reduce)'
      ).matches
    ) return

    let len = 0

    const build = () => {
      const parent = svg.parentElement
      const h = parent ? parent.scrollHeight : document.documentElement.scrollHeight
      const w = window.innerWidth
      const x = w * 0.05
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
