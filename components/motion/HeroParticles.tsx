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

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let parts: Particle[] = []
    const MAX_PARTS = 1600

    const edgeSpawn = () => {
      const edge = Math.floor(Math.random() * 4)
      const m = 30 + Math.random() * 90
      switch (edge) {
        case 0: return { x: -m, y: Math.random() * h }
        case 1: return { x: w + m, y: Math.random() * h }
        case 2: return { x: Math.random() * w, y: -m }
        default: return { x: Math.random() * w, y: h + m }
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
      const gap = Math.max(5, Math.round(w / 260))
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
      if (!w || !h) return

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const pts = sampleText()
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pts[i], pts[j]] = [pts[j], pts[i]]
      }
      const targets = pts.slice(0, MAX_PARTS)

      parts = targets.map((t) => {
        const accent = Math.random() < 0.3
        return {
          ...edgeSpawn(),
          vx: 0,
          vy: 0,
          tx: t.x,
          ty: t.y,
          c: accent ? '143,151,221' : '245,244,241',
          a: accent ? 0.5 : 0.3,
          wait: Math.floor(Math.random() * 90),
        }
      })
    }

    build()

    let resizeRaf = 0
    const scheduleBuild = () => {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(build)
    }
    window.addEventListener('resize', scheduleBuild)

    let disposed = false
    document.fonts?.ready.then(() => {
      if (!disposed) scheduleBuild()
    })

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
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseout', onOut)

    let raf = 0
    let readyToAnimate = false
    let inViewport = false
    let pageVisible = document.visibilityState === 'visible'

    const tick = () => {
      if (!readyToAnimate || !inViewport || !pageVisible) {
        raf = 0
        return
      }

      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.32)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      for (const p of parts) {
        if (p.wait > 0) {
          p.wait--
          continue
        }

        p.vx += (p.tx - p.x) * 0.012
        p.vy += (p.ty - p.y) * 0.012

        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 12100) {
          const d = Math.sqrt(d2) || 1
          const f = ((110 - d) / 110) * 2.4
          p.vx += (dx / d) * f
          p.vy += (dy / d) * f
        }

        p.vx *= 0.88
        p.vy *= 0.88

        const spd = Math.hypot(p.vx, p.vy)
        if (spd > 4.5) {
          p.vx = (p.vx / spd) * 4.5
          p.vy = (p.vy / spd) * 4.5
        }

        p.x += p.vx
        p.y += p.vy

        ctx.fillStyle = `rgba(${p.c},${p.a})`
        ctx.fillRect(p.x, p.y, 1.4, 1.4)
      }
      raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const requestRun = () => {
      if (raf || !readyToAnimate || !inViewport || !pageVisible) return
      raf = requestAnimationFrame(tick)
    }

    const unlock = () => {
      readyToAnimate = true
      requestRun()
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting
        if (inViewport) requestRun()
        else stop()
      },
      { rootMargin: '25% 0px 25% 0px' }
    )
    visibilityObserver.observe(canvas)

    const onVisibilityChange = () => {
      pageVisible = document.visibilityState === 'visible'
      if (pageVisible) requestRun()
      else stop()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    window.addEventListener('gt:curtain-open', unlock, { once: true })
    const fallback = setTimeout(unlock, 4200)

    return () => {
      disposed = true
      stop()
      cancelAnimationFrame(resizeRaf)
      clearTimeout(fallback)
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('gt:curtain-open', unlock)
      window.removeEventListener('resize', scheduleBuild)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onOut)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero__particles" aria-hidden="true" />
}
