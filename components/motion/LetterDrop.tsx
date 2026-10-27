'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useMotionPrefs } from './useMotion'

/**
 * Easter egg do rodapé: "Soltar as letras". A assinatura Gandra.tech
 * desmonta — cada letra cai com gravidade, quica no chão do rodapé e pode
 * ser arrastada e arremessada (mouse ou dedo). "Arrumar" devolve tudo ao
 * lugar. As letras soltas são cópias decorativas (aria-hidden); a
 * assinatura original só fica invisível enquanto a brincadeira dura.
 * Com prefers-reduced-motion o botão nem aparece.
 */
type Body = {
  el: HTMLSpanElement
  x: number
  y: number
  vx: number
  vy: number
  r: number
  vr: number
  w: number
  h: number
  home: { x: number; y: number }
  drag: { id: number; dx: number; dy: number; lx: number; ly: number; lt: number } | null
}

export default function LetterDrop({ targetSelector }: { targetSelector: string }) {
  const { ready, reduced } = useMotionPrefs()
  const [loose, setLoose] = useState(false)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const bodiesRef = useRef<Body[]>([])
  const rafRef = useRef(0)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }, [])

  const drop = useCallback(() => {
    const mark = document.querySelector<HTMLElement>(targetSelector)
    const footer = mark?.closest('footer') as HTMLElement | null
    if (!mark || !footer) return
    const letters = Array.from(mark.querySelectorAll<HTMLElement>('.kinetic__letter'))
    if (!letters.length) return

    const fr = footer.getBoundingClientRect()
    const stage = document.createElement('div')
    stage.className = 'm-drop'
    stage.setAttribute('aria-hidden', 'true')
    footer.appendChild(stage)
    stageRef.current = stage

    const bodies: Body[] = letters.map((letter) => {
      const r = letter.getBoundingClientRect()
      const cs = getComputedStyle(letter)
      const el = document.createElement('span')
      el.className = 'm-drop__letter'
      el.textContent = letter.textContent
      el.style.fontSize = cs.fontSize
      el.style.fontVariationSettings = cs.fontVariationSettings
      el.style.lineHeight = cs.lineHeight
      el.style.color = cs.color
      stage.appendChild(el)
      // A assinatura usa scaleX para caber; a cópia herda a mesma largura.
      const sx = r.width / Math.max(1, el.offsetWidth)
      el.style.setProperty('--sx', sx.toFixed(3))
      const x = r.left - fr.left
      const y = r.top - fr.top
      return { el, x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 6, r: 0, vr: (Math.random() - 0.5) * 6, w: r.width, h: r.height, home: { x, y }, drag: null }
    })
    bodiesRef.current = bodies
    mark.style.visibility = 'hidden'

    // O chão é o topo da barra final: as letras não cobrem links nem o botão.
    const bar = footer.querySelector<HTMLElement>('.m-footer__bar')
    const floor = () => (bar ? bar.getBoundingClientRect().top - footer.getBoundingClientRect().top : footer.clientHeight)

    const tick = () => {
      const W = footer.clientWidth
      const H = floor()
      for (const b of bodies) {
        if (!b.drag) {
          b.vy += 0.6
          b.vx *= 0.99
          b.vr *= 0.97
          b.x += b.vx
          b.y += b.vy
          b.r += b.vr
          if (b.y + b.h > H) {
            b.y = H - b.h
            b.vy *= -0.45
            b.vx *= 0.86
            b.vr *= 0.7
            if (Math.abs(b.vy) < 0.8) b.vy = 0
          }
          if (b.x < 0) {
            b.x = 0
            b.vx *= -0.6
          } else if (b.x + b.w > W) {
            b.x = W - b.w
            b.vx *= -0.6
          }
        }
        b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${b.r.toFixed(1)}deg) scaleX(var(--sx))`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    // Arrastar e arremessar com Pointer Events (mouse, caneta e toque).
    stage.addEventListener('pointerdown', (e) => {
      const el = (e.target as Element).closest('.m-drop__letter') as HTMLSpanElement | null
      const b = bodies.find((body) => body.el === el)
      if (!b || !el) return
      e.preventDefault()
      el.setPointerCapture(e.pointerId)
      const r = footer.getBoundingClientRect()
      b.drag = { id: e.pointerId, dx: e.clientX - r.left - b.x, dy: e.clientY - r.top - b.y, lx: e.clientX, ly: e.clientY, lt: performance.now() }
      el.classList.add('is-grabbed')
    })
    stage.addEventListener('pointermove', (e) => {
      const b = bodies.find((body) => body.drag?.id === e.pointerId)
      if (!b?.drag) return
      const r = footer.getBoundingClientRect()
      const now = performance.now()
      const dt = Math.max(1, now - b.drag.lt)
      b.vx = ((e.clientX - b.drag.lx) / dt) * 16
      b.vy = ((e.clientY - b.drag.ly) / dt) * 16
      b.vr = b.vx * 0.4
      b.x = e.clientX - r.left - b.drag.dx
      b.y = e.clientY - r.top - b.drag.dy
      b.drag.lx = e.clientX
      b.drag.ly = e.clientY
      b.drag.lt = now
    })
    const end = (e: PointerEvent) => {
      const b = bodies.find((body) => body.drag?.id === e.pointerId)
      if (!b) return
      b.drag = null
      b.el.classList.remove('is-grabbed')
    }
    stage.addEventListener('pointerup', end)
    stage.addEventListener('pointercancel', end)
  }, [targetSelector])

  const tidy = useCallback(() => {
    stop()
    const stage = stageRef.current
    const bodies = bodiesRef.current
    const mark = document.querySelector<HTMLElement>(targetSelector)
    if (!stage) return
    gsap.to(bodies, {
      x: (i: number) => bodies[i].home.x,
      y: (i: number) => bodies[i].home.y,
      r: 0,
      duration: 0.9,
      ease: 'expo.inOut',
      stagger: 0.03,
      onUpdate: () => {
        for (const b of bodies) b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.r}deg) scaleX(var(--sx))`
      },
      onComplete: () => {
        if (mark) mark.style.removeProperty('visibility')
        stage.remove()
        stageRef.current = null
        bodiesRef.current = []
      },
    })
  }, [stop, targetSelector])

  const toggle = () => {
    if (loose) tidy()
    else drop()
    setLoose(!loose)
  }

  // Ao sair da página (ou se o sistema pedir menos movimento), arruma tudo.
  useEffect(() => {
    return () => {
      stop()
      stageRef.current?.remove()
      const mark = document.querySelector<HTMLElement>(targetSelector)
      if (mark) mark.style.removeProperty('visibility')
    }
  }, [stop, targetSelector])

  if (!ready || reduced) return null

  return (
    <button type="button" className="m-drop__toggle mono" onClick={toggle}>
      {loose ? 'Arrumar as letras' : 'Soltar as letras'} <span aria-hidden="true">✶</span>
    </button>
  )
}
