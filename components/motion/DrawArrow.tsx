'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin)

interface Props {
  /** Tamanho em px (a seta é quadrada). */
  size?: number
  className?: string
  /** Atraso após entrar na viewport. */
  delay?: number
  duration?: number
}

/**
 * Seta diagonal (↗) que se desenha ao entrar na tela, traço por traço:
 * primeiro a haste, depois a ponta.
 *
 * Substitui o caractere '↗' onde vale a pena animar — glifo de fonte não
 * pode ser desenhado, só um path SVG.
 */
export default function DrawArrow({
  size = 14,
  className,
  delay = 0,
  duration = 0.5,
}: Props) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return

    const paths = svg.querySelectorAll<SVGPathElement>('path')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const from = { drawSVG: '0%' }
    gsap.set(paths, from)

    let played = false
    const animate = () => {
      if (played) return
      played = true
      gsap.to(paths, {
        drawSVG: '100%',
        duration,
        delay,
        ease: 'power2.out',
        stagger: 0.12,
      })
    }

    const st = ScrollTrigger.create({
      trigger: svg,
      start: 'top 92%',
      onEnter: animate,
    })

    // Já visível na montagem não dispara onEnter.
    if (svg.getBoundingClientRect().top < window.innerHeight * 0.92) animate()

    return () => st.kill()
  }, [])

  return (
    <svg
      ref={ref}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* haste da diagonal */}
      <path d="M3.5 12.5 L12.5 3.5" />
      {/* ponta */}
      <path d="M5.5 3.5 L12.5 3.5 L12.5 10.5" />
    </svg>
  )
}
