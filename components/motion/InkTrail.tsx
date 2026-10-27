'use client'
import { useEffect, useRef } from 'react'

/**
 * Rastro de nanquim no final em tinta: o cursor deixa um traço vermelhão
 * que afina e some. Canvas 2D desenhado só enquanto há traço vivo (o loop
 * para sozinho em repouso — nada de rAF eterno). Só com ponteiro fino e
 * sem prefers-reduced-motion; no resto, o canvas fica vazio e invisível.
 */
type Point = { x: number; y: number; t: number; w: number }

const LIFE = 900

export default function InkTrail() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let points: Point[] = []
    let raf = 0
    let dpr = 1
    const color = getComputedStyle(host).getPropertyValue('--m-signal').trim() || '#e5401a'

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(host.clientWidth * dpr)
      canvas.height = Math.round(host.clientHeight * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    const draw = () => {
      const now = performance.now()
      points = points.filter((p) => now - p.t < LIFE)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = color
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1]
        const b = points[i]
        const life = 1 - (now - b.t) / LIFE
        ctx.globalAlpha = Math.max(0, life) * 0.9
        ctx.lineWidth = Math.max(0.6, b.w * life)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      raf = points.length ? requestAnimationFrame(draw) : 0
    }

    let last: Point | null = null
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const t = performance.now()
      // Pincel: quanto mais rápido, mais fino — como nanquim de verdade.
      const speed = last ? Math.hypot(x - last.x, y - last.y) / Math.max(1, t - last.t) : 0
      const w = Math.max(2, 14 - speed * 6)
      last = { x, y, t, w }
      points.push(last)
      if (points.length > 90) points.shift()
      if (!raf) raf = requestAnimationFrame(draw)
    }
    const onLeave = () => {
      last = null
    }

    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="m-ink-trail" aria-hidden="true" />
}
