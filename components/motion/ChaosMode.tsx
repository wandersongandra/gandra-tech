'use client'
import { useEffect } from 'react'
import gsap from 'gsap'

const SECRET = 'gandra'

/**
 * Easter egg: digitar "gandra" (fora de inputs) solta o modo caos — os
 * elementos da página flutuam em deriva elástica por alguns segundos e
 * voltam ao lugar. Nenhum indício visual de que existe.
 */
export default function ChaosMode() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let buffer = ''
    let busy = false

    const onKey = (e: KeyboardEvent) => {
      if (busy || e.key.length !== 1) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      buffer = (buffer + e.key.toLowerCase()).slice(-SECRET.length)
      if (buffer !== SECRET) return
      busy = true

      const els = document.querySelectorAll(
        'h1, h2, h3, .work-item__mockup, .site-header__logo, .services__item'
      )
      els.forEach((el) => {
        gsap.to(el, {
          x: gsap.utils.random(-60, 60),
          y: gsap.utils.random(-40, 40),
          rotation: gsap.utils.random(-8, 8),
          duration: 1.4,
          ease: 'elastic.out(1, 0.4)',
          yoyo: true,
          repeat: 1,
          onComplete: () => gsap.set(el, { clearProps: 'transform' }),
        })
      })

      setTimeout(() => {
        busy = false
      }, 3200)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return null
}
