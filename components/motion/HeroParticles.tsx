'use client'
import { useRef, useEffect } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  tx: number
  ty: number
  c: string
  a: number
  wait: number
}

/**
 * Texto de partículas do hero. Desktop mantém a versão cinematográfica;
 * smartphones usam menos partículas, DPR menor, sem interação por mouse e
 * encerram o loop depois da formação para poupar bateria/GPU.
 */
export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const compact = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    const dpr = compact ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    const maxParts = compact ? 520 : 1600
    let w = 0
    let h = 0
    let parts: Particle[] = []

    const edgeSpawn = () => {
      const edge = Math.floor(Math.random() * 4)
      const margin = compact ? 24 + Math.random() * 36 : 30 + Math.random() * 90
      switch (edge) {
        case 0: return { x: -margin, y: Math.random() * h }
        case 1: return { x: w + margin, y: Math.random() * h }
        case 2: return { x: Math.random() * w, y: -margin }
        default: return { x: Math.random() * w, y: h + margin }
      }
    }

    const sampleText = (): { x: number; y: number }[] => {
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d')
      if (!octx) return []

      const isSmall = w < 768
      const fontSize = isSmall ? w * 0.17 : Math.min(w * 0.22, h * 0.36)
      const centerY = isSmall ? h * 0.3 : h / 2
      octx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`
      octx.textAlign = 'center'
      octx.textBaseline = 'middle'
      octx.fillStyle = '#fff'
      octx.fillText('GANDRA', w / 2, centerY - fontSize * 0.55)
      octx.fillText('TECH', w / 2, centerY + fontSize * 0.55)

      const data = octx.getImageData(0, 0, w, h).data
      const gap = Math.max(compact ? 6 : 5, Math.round(w / 260))
      const pts: { x: number; y: number }[] = []
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x, y })
        }
      }
      return pts
    }

    const build = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const r = parent.getBoundingClientRect()
      w = Math.round(r.width)
      h = Math.round(r.height)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const pts = sampleText()
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pts[i], pts[j]] = [pts[j], pts[i]]
      }
      const targets = pts.slice(0, maxParts)

      parts = targets.map((target) => {
        const accent = Math.random() < 0.3
        return {
          ...edgeSpawn(),
          vx: 0,
          vy: 0,
          tx: target.x,
          ty: target.y,
          c: accent ? '143,151,221' : '245,244,241',
          a: accent ? (compact ? 0.42 : 0.5) : (compact ? 0.24 : 0.3),
          wait: Math.floor(Math.random() * (compact ? 30 : 90)),
        }
      })
    }

    build()
    window.addEventListener('resize', build)
    document.fonts?.ready.then(build)

    const mouse = { x: -9999, y: -9999 }
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onOut = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    if (!compact) {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseout', onOut)
    }

    let raf = 0
    let frame = 0
    const tick = () => {
      frame += 1
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = compact ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.32)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      for (const p of parts) {
        if (p.wait > 0) {
          p.wait--
          continue
        }

        const spring = compact ? 0.018 : 0.012
        p.vx += (p.tx - p.x) * spring
        p.vy += (p.ty - p.y) * spring

        if (!compact) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < 12100) {
            const d = Math.sqrt(d2) || 1
            const force = ((110 - d) / 110) * 2.4
            p.vx += (dx / d) * force
            p.vy += (dy / d) * force
          }
        }

        p.vx *= compact ? 0.84 : 0.88
        p.vy *= compact ? 0.84 : 0.88

        const maxSpeed = compact ? 5.2 : 4.5
        const speed = Math.hypot(p.vx, p.vy)
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed
          p.vy = (p.vy / speed) * maxSpeed
        }

        p.x += p.vx
        p.y += p.vy

        ctx.fillStyle = `rgba(${p.c},${p.a})`
        ctx.fillRect(p.x, p.y, compact ? 1.2 : 1.4, compact ? 1.2 : 1.4)
      }

      if (compact && frame >= 300) return
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (raf || frame > 0) return
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('gt:curtain-open', start, { once: true })
    const fallback = setTimeout(start, compact ? 1600 : 4200)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fallback)
      window.removeEventListener('gt:curtain-open', start)
      window.removeEventListener('resize', build)
      if (!compact) {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseout', onOut)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="hero__particles" aria-hidden="true" />
}
