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
 * Texto de partículas: o nome GANDRA/TECH é desenhado num canvas offscreen
 * e os pixels viram alvos. Cada partícula é puxada por uma mola para o seu
 * ponto do texto — o cursor dispersa, a mola reagrupa.
 */
export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const compact = window.matchMedia('(max-width: 767px)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const lowPowerMode = compact || coarsePointer
    const dpr = Math.min(window.devicePixelRatio || 1, lowPowerMode ? 1.25 : 2)
    let w = 0
    let h = 0
    let parts: Particle[] = []
    const maxParts = lowPowerMode ? 420 : 1600

    // Nasce fora da tela, numa borda aleatória — a entrada é uma chegada
    // de todos os cantos, não um fade.
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

    // Amostra os pixels do texto e devolve os pontos-alvo.
    const sampleText = (): { x: number; y: number }[] => {
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d')
      if (!octx) return []

      // No mobile o nome sobe para o terço superior e encolhe — no centro
      // ele colidia com o título e o subtítulo.
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
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const pts = sampleText()
      // Distribui o excesso de pontos: embaralha e corta no limite.
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pts[i], pts[j]] = [pts[j], pts[i]]
      }
      const targets = pts.slice(0, maxParts)

      parts = targets.map((t) => {
        const accent = Math.random() < 0.3
        return {
          ...edgeSpawn(),
          vx: 0,
          vy: 0,
          tx: t.x,
          ty: t.y,
          c: accent ? '143,151,221' : '245,244,241', // acento / papel
          // Marca d'água: brilho baixo para não brigar com o título.
          a: accent ? 0.5 : 0.3,
          // Espera em frames antes de partir: a chegada acontece em ondas.
          wait: Math.floor(Math.random() * (lowPowerMode ? 54 : 90)),
        }
      })
    }

    build()
    window.addEventListener('resize', build)
    // A amostragem usa a Inter: reconstrói quando ela terminar de carregar.
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
    if (!coarsePointer) {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseout', onOut)
    }

    let raf = 0
    let lastFrame = 0
    const frameInterval = lowPowerMode ? 1000 / 30 : 0
    const tick = (now: number) => {
      if (frameInterval && now - lastFrame < frameInterval) {
        raf = requestAnimationFrame(tick)
        return
      }
      lastFrame = now
      // Rastro transparente: apagar uma fração do frame anterior em vez de
      // pintar preto por cima — um véu opaco cobriria o blob WebGL abaixo.
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.32)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      for (const p of parts) {
        // Onda de chegada: cada partícula espera a sua vez de partir.
        if (p.wait > 0) {
          p.wait--
          continue
        }

        // Mola suave para o ponto do texto.
        p.vx += (p.tx - p.x) * 0.012
        p.vy += (p.ty - p.y) * 0.012

        // O cursor dispersa num raio de 110px.
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

        // Teto de velocidade: a viagem até o nome é uma flutuação
        // cinematográfica, não um disparo.
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

    // Só começa quando a cortina abre — a formação do nome é a primeira
    // coisa que se vê. O timeout é rede de segurança caso o evento se perca.
    const start = () => {
      if (raf) return
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('gt:curtain-open', start, { once: true })
    const fallback = setTimeout(start, lowPowerMode ? 2400 : 4200)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fallback)
      window.removeEventListener('gt:curtain-open', start)
      window.removeEventListener('resize', build)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onOut)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero__particles" aria-hidden="true" />
}
