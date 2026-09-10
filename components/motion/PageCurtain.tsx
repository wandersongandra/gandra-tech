'use client'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import gsap from 'gsap'

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

    const sweep = sweepRef.current
    const drawExit = () => path.setAttribute('d', exitD(sweep.b))

    // Varredura de saída: o painel sobe enquanto a borda inferior estica
    // no início do movimento e recolhe conforme ele ganha velocidade.
    const sweepOut = (delay = 0) => {
      sweep.b = 0
      drawExit()
      gsap.timeline({ delay, onStart: () => window.dispatchEvent(new Event('gt:curtain-open')) })
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
      const isFirstVisit = !sessionStorage.getItem('gt-loaded')

      if (isFirstVisit) {
        sessionStorage.setItem('gt-loaded', '1')
        const count = countRef.current
        const counter = { v: 0 }
        // Preloader: contador 0→100 enquanto o logo entra (com glitch RGB
        // no CSS), depois os dois saem e a cortina varre para cima.
        gsap.timeline()
          .fromTo(logo,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.2 })
          .fromTo(count,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' }, '<')
          .to(counter, {
            v: 100,
            duration: 1.15,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (count) count.textContent = String(Math.round(counter.v)).padStart(3, '0')
            },
          }, '<0.1')
          .to(logo,
            { opacity: 0, y: -14, duration: 0.4, ease: 'power3.in', delay: 0.15 })
          .to(count, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '<')
          .add(() => sweepOut())
      } else {
        // Returning user or came via navigation — reveal fast
        sweepOut(0.05)
      }
      return
    }

    // Subsequent pathname changes: panel is at yPercent:0 (was animated in), sweep out
    sweepOut(0.05)
  }, [pathname])

  // Intercepta apenas navegação interna comum. Cliques modificados, downloads,
  // novas abas e links externos preservam integralmente o comportamento nativo.
  useEffect(() => {
    const panel = panelRef.current
    const path = pathRef.current
    if (!panel || !path) return

    const sweep = sweepRef.current
    const drawEnter = () => path.setAttribute('d', enterD(sweep.b))

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) return

      const target = e.target
      if (!(target instanceof Element)) return

      const a = target.closest('a[href]') as HTMLAnchorElement | null
      if (!a || a.hasAttribute('download')) return

      const linkTarget = a.getAttribute('target')
      if (linkTarget && linkTarget.toLowerCase() !== '_self') return

      const href = a.getAttribute('href')
      if (!href || href.startsWith('#')) return

      let destination: URL
      try {
        destination = new URL(a.href, window.location.href)
      } catch {
        return
      }

      if (
        destination.origin !== window.location.origin ||
        !['http:', 'https:'].includes(destination.protocol)
      ) return

      const current = new URL(window.location.href)
      const sameDocument =
        destination.pathname === current.pathname &&
        destination.search === current.search

      if (sameDocument) return

      const routerHref = `${destination.pathname}${destination.search}${destination.hash}`

      e.preventDefault()
      gsap.killTweensOf(panel)
      gsap.killTweensOf(sweep)
      sweep.b = 0
      drawEnter()

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
            onComplete: () => router.push(routerHref),
          },
          0
        )
        .to(sweep, { b: 20, duration: 0.22, ease: 'power2.out', onUpdate: drawEnter }, 0)
        .to(sweep, { b: 0, duration: 0.5, ease: 'power3.inOut', onUpdate: drawEnter }, 0.22)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [router])

  return (
    <div ref={panelRef} className="curtain">
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
