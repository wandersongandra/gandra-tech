'use client'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import gsap from 'gsap'
import { getReducedMotionQuery } from './reducedMotion'

/**
 * Cortina de página em blob: um path SVG cobre a viewport e a borda
 * deforma durante a varredura, como tecido puxado. Na saída (painel sobe),
 * a borda inferior estica para baixo e depois recolhe; na entrada (painel
 * vem de baixo), a borda superior avança numa crista e assenta.
 *
 * `b` é a profundidade da deformação em centésimos da altura da viewport
 * (viewBox 0..100 com preserveAspectRatio="none").
 */
const exitD = (b: number) => `M 0 0 H 100 V 100 Q 50 ${100 + b} 0 100 Z`
const enterD = (b: number) => `M 0 0 Q 50 ${-b} 100 0 V 100 H 0 Z`
const FLAT = exitD(0)

export default function PageCurtain() {
  const panelRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const logoRef = useRef<HTMLSpanElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  // Objeto-mutação dirigido pelos tweens — fora do state para não rerenderizar.
  const sweepRef = useRef({ b: 0 })
  const didMount = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  // Entrance: animate panel out on mount / route change
  useEffect(() => {
    const panel = panelRef.current
    const path = pathRef.current
    const logo = logoRef.current
    if (!panel || !path || !logo) return
    const motionQuery = getReducedMotionQuery()
    let tl: gsap.core.Timeline | null = null

    const hidePanel = () => {
      tl?.kill()
      gsap.killTweensOf([panel, path, logo, countRef.current, sweepRef.current])
      panel.style.visibility = 'hidden'
      panel.style.transform = 'translateY(-100%)'
      panel.inert = true
      path.setAttribute('d', FLAT)
    }

    if (motionQuery.matches) {
      hidePanel()
      window.dispatchEvent(new Event('gt:curtain-open'))
      return
    }

    const sweep = sweepRef.current
    const drawExit = () => path.setAttribute('d', exitD(sweep.b))

    // Varredura de saída: o painel sobe enquanto a borda inferior estica
    // no início do movimento e recolhe conforme ele ganha velocidade.
    const sweepOut = (delay = 0) => {
      sweep.b = 0
      drawExit()
      panel.style.visibility = 'visible'
      panel.inert = true
      tl = gsap.timeline({
        delay,
        onStart: () => window.dispatchEvent(new Event('gt:curtain-open')),
        onComplete: hidePanel,
      })
        .fromTo(
          panel,
          { yPercent: 0 },
          { yPercent: -100, duration: 0.9, ease: 'power3.inOut' },
          0
        )
        .to(sweep, { b: 22, duration: 0.32, ease: 'power2.in', onUpdate: drawExit }, 0)
        .to(sweep, { b: 0, duration: 0.6, ease: 'power3.out', onUpdate: drawExit }, 0.32)
    }

    if (!didMount.current) {
      didMount.current = true
      hidePanel()
      window.dispatchEvent(new Event('gt:curtain-open'))
      return
    }

    // Subsequent pathname changes: panel is at yPercent:0 (was animated in), sweep out
    sweepOut(0.05)

    const handleMotionChange = () => {
      if (motionQuery.matches) hidePanel()
    }
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      hidePanel()
    }
  }, [pathname])

  // Global link click interception → animate panel in, then navigate
  useEffect(() => {
    const panel = panelRef.current
    const path = pathRef.current
    if (!panel || !path) return
    const motionQuery = getReducedMotionQuery()
    if (motionQuery.matches) return

    const sweep = sweepRef.current
    const drawEnter = () => path.setAttribute('d', enterD(sweep.b))

    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest('a[href]') as HTMLAnchorElement | null
      if (!a) return

      const href = a.getAttribute('href') ?? ''
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('#') ||
        a.target ||
        a.hasAttribute('download')
      ) return

      const targetPath = href.split('?')[0]
      if (targetPath === window.location.pathname) return

      e.preventDefault()
      gsap.killTweensOf(panel)
      gsap.killTweensOf(sweep)
      sweep.b = 0
      drawEnter()
      panel.style.visibility = 'visible'
      panel.inert = true

      // Varredura de entrada: a crista avança à frente do painel e assenta
      // quando ele cobre a tela — aí a navegação acontece por baixo.
      gsap.timeline()
        .fromTo(
          panel,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 0.6,
            ease: 'power3.inOut',
            onComplete: () => router.push(href),
          },
          0
        )
        .to(sweep, { b: 20, duration: 0.22, ease: 'power2.out', onUpdate: drawEnter }, 0)
        .to(sweep, { b: 0, duration: 0.5, ease: 'power3.inOut', onUpdate: drawEnter }, 0.22)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [pathname, router])

  return (
    <div ref={panelRef} className="curtain" aria-hidden="true" inert>
      <svg
        className="curtain__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path ref={pathRef} d={FLAT} />
      </svg>
      <span ref={logoRef} className="curtain__logo">GANDRA TECH</span>
      <span ref={countRef} className="curtain__count">000</span>
    </div>
  )
}
