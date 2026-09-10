'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const ECHO_POOL_SIZE = 12

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.set([dot, ring], { autoAlpha: 0 })
    let revealed = false

    const xDot = gsap.quickTo(dot, 'x', { duration: reducedMotion ? 0 : 0.08, ease: 'power3' })
    const yDot = gsap.quickTo(dot, 'y', { duration: reducedMotion ? 0 : 0.08, ease: 'power3' })
    const xRing = gsap.quickTo(ring, 'x', { duration: reducedMotion ? 0 : 0.38, ease: 'power3' })
    const yRing = gsap.quickTo(ring, 'y', { duration: reducedMotion ? 0 : 0.38, ease: 'power3' })

    const echoes = reducedMotion
      ? []
      : Array.from({ length: ECHO_POOL_SIZE }, () => {
          const echo = document.createElement('div')
          echo.className = 'c-echo'
          echo.setAttribute('aria-hidden', 'true')
          document.body.appendChild(echo)
          gsap.set(echo, { autoAlpha: 0 })
          return echo
        })
    let echoIndex = 0
    let lastSpawn = 0

    const onMove = (event: MouseEvent) => {
      if (!revealed) {
        revealed = true
        gsap.to([dot, ring], { autoAlpha: 1, duration: reducedMotion ? 0 : 0.3 })
      }

      xDot(event.clientX)
      yDot(event.clientY)
      xRing(event.clientX)
      yRing(event.clientY)

      if (!echoes.length) return
      const now = performance.now()
      if (now - lastSpawn < 80) return
      lastSpawn = now

      const echo = echoes[echoIndex]
      echoIndex = (echoIndex + 1) % echoes.length
      gsap.killTweensOf(echo)
      gsap.fromTo(
        echo,
        { x: event.clientX, y: event.clientY, scale: 1, opacity: 0.55 },
        { scale: 0, opacity: 0, duration: 0.8, ease: 'power2.out' }
      )
    }

    const grow = () => gsap.to(ring, { scale: 2.6, duration: reducedMotion ? 0 : 0.4, ease: 'power2.out' })
    const growBig = () => gsap.to(ring, { scale: 4.5, duration: reducedMotion ? 0 : 0.45, ease: 'power2.out' })
    const shrink = () => gsap.to(ring, { scale: 1, duration: reducedMotion ? 0 : 0.4, ease: 'power2.out' })

    let hovered: Element | null = null

    const interactiveFor = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null
      return target.closest('.work-item, a, button')
    }

    const onPointerOver = (event: PointerEvent) => {
      const interactive = interactiveFor(event.target)
      if (!interactive || interactive === hovered) return
      hovered = interactive
      if (interactive.matches('.work-item')) growBig()
      else grow()
    }

    const onPointerOut = (event: PointerEvent) => {
      const current = interactiveFor(event.target)
      if (!current || current !== hovered) return
      const next = interactiveFor(event.relatedTarget)
      if (next === current) return
      hovered = next
      if (!next) shrink()
      else if (next.matches('.work-item')) growBig()
      else grow()
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('pointerover', onPointerOver, { passive: true })
    document.addEventListener('pointerout', onPointerOut, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      gsap.killTweensOf([dot, ring, ...echoes])
      echoes.forEach((echo) => echo.remove())
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="c-dot" aria-hidden="true" />
      <div ref={ringRef} className="c-ring" aria-hidden="true" />
    </>
  )
}
