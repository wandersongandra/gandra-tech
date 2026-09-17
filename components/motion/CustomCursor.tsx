'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    // Escondidos até o primeiro movimento do mouse — evita o anel parado
    // no canto superior esquerdo antes de qualquer interação.
    gsap.set([dot, ring], { autoAlpha: 0 })
    let revealed = false

    const xDot = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' })
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' })
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.38, ease: 'power3' })
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.38, ease: 'power3' })

    const onMove = (e: MouseEvent) => {
      if (!revealed) {
        revealed = true
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 })
      }
      xDot(e.clientX)
      yDot(e.clientY)
      xRing(e.clientX)
      yRing(e.clientY)
    }

    const grow = () => gsap.to(ring, { scale: 2.6, duration: 0.4, ease: 'power2.out' })
    const shrink = () => gsap.to(ring, { scale: 1, duration: 0.4, ease: 'power2.out' })
    const growBig = () => gsap.to(ring, { scale: 4.5, duration: 0.45, ease: 'power2.out' })

    window.addEventListener('mousemove', onMove)

    // Rastro: ecos que nascem do movimento e morrem em fade. Herdam o
    // mix-blend difference do cursor, então invertem cor em qualquer fundo.
    let lastSpawn = 0
    const echoes = new Set<HTMLDivElement>()
    const onMoveEcho = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastSpawn < 80) return
      lastSpawn = now
      if (echoes.size > 16) return
      const echo = document.createElement('div')
      echo.className = 'c-echo'
      echo.setAttribute('aria-hidden', 'true')
      echoes.add(echo)
      document.body.appendChild(echo)
      gsap.fromTo(
        echo,
        { x: e.clientX, y: e.clientY, scale: 1, opacity: 0.55 },
        {
          scale: 0,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => {
            echoes.delete(echo)
            echo.remove()
          },
        }
      )
    }
    window.addEventListener('mousemove', onMoveEcho)

    const interactiveAt = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null
      const workItem = target.closest('.work-item')
      if (workItem) return { element: workItem, large: true }
      const control = target.closest('a, button')
      return control ? { element: control, large: false } : null
    }

    const onOver = (e: MouseEvent) => {
      const current = interactiveAt(e.target)
      const previous = interactiveAt(e.relatedTarget)
      if (!current || current.element === previous?.element) return
      if (current.large) growBig()
      else grow()
    }

    const onOut = (e: MouseEvent) => {
      const current = interactiveAt(e.target)
      const next = interactiveAt(e.relatedTarget)
      if (current && current.element !== next?.element) shrink()
    }

    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousemove', onMoveEcho)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      gsap.killTweensOf([dot, ring])
      gsap.killTweensOf(Array.from(echoes))
      echoes.forEach((echo) => echo.remove())
      echoes.clear()
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="c-dot" aria-hidden="true" />
      <div ref={ringRef} className="c-ring" aria-hidden="true" />
    </>
  )
}
