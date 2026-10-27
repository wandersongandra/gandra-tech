'use client'
import { useRef, useEffect } from 'react'

/**
 * Playground do 404: os dígitos caem do céu, quicam no chão e fogem do
 * cursor. Física simples por frame — gravidade, amortecimento e repulsão.
 */
export default function NotFoundLetters() {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const els = Array.from(box.querySelectorAll<HTMLElement>('[data-letter]'))
    if (!els.length) return

    const mouse = { x: -9999, y: -9999 }
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    // no toque, o dedo empurra os dígitos (pointerdown + arrasto)
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') onLeave()
    }
    box.addEventListener('pointermove', onMove)
    box.addEventListener('pointerdown', onMove)
    box.addEventListener('pointerup', onUp)
    box.addEventListener('pointerleave', onLeave)

    const bodies = els.map((el, i) => ({
      el,
      x: (i + 0.5) * (box.clientWidth / els.length) - el.offsetWidth / 2 + (Math.random() * 60 - 30),
      y: -220 - i * 180,
      vx: 0,
      vy: 0,
      r: 0,
      vr: (Math.random() - 0.5) * 4,
    }))

    let raf = requestAnimationFrame(function tick() {
      const floor = box.clientHeight - els[0].offsetHeight
      for (const b of bodies) {
        b.vy += 0.5

        // Repulsão do cursor num raio de 150px.
        const cx = b.x + b.el.offsetWidth / 2
        const cy = b.y + b.el.offsetHeight / 2
        const dx = cx - mouse.x
        const dy = cy - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 22500) {
          const d = Math.sqrt(d2) || 1
          const f = ((150 - d) / 150) * 2.2
          b.vx += (dx / d) * f
          b.vy += (dy / d) * f
          b.vr += (Math.random() - 0.5) * 0.8
        }

        b.vx *= 0.985
        b.vr *= 0.96
        b.x += b.vx
        b.y += b.vy
        b.r += b.vr

        // Chão e paredes com quique amortecido.
        if (b.y > floor) {
          b.y = floor
          b.vy *= -0.55
          b.vx *= 0.9
          if (Math.abs(b.vy) < 1) b.vy = 0
        }
        const maxX = box.clientWidth - b.el.offsetWidth
        if (b.x < 0) {
          b.x = 0
          b.vx *= -0.6
        } else if (b.x > maxX) {
          b.x = maxX
          b.vx *= -0.6
        }

        b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.r}deg)`
      }
      raf = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(raf)
      box.removeEventListener('pointermove', onMove)
      box.removeEventListener('pointerdown', onMove)
      box.removeEventListener('pointerup', onUp)
      box.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={boxRef} className="nf-play" aria-hidden="true">
      <span data-letter className="nf-play__letter">4</span>
      <span data-letter className="nf-play__letter">0</span>
      <span data-letter className="nf-play__letter">4</span>
    </div>
  )
}
