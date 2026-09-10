'use client'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import gsap from 'gsap'

const exitD = (b: number) => `M 0 0 H 100 V 100 Q 50 ${100 + b} 0 100 Z`
const enterD = (b: number) => `M 0 0 Q 50 ${-b} 100 0 V 100 H 0 Z`
const FLAT = exitD(0)

export default function PageCurtain() {
  const panelRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const logoRef = useRef<HTMLSpanElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const sweepRef = useRef({ b: 0 })
  const didMount = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const panel = panelRef.current
    const path = pathRef.current
    const logo = logoRef.current
    const count = countRef.current
    if (!panel || !path || !logo || !count) return

    const compact = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sweep = sweepRef.current
    const drawExit = () => path.setAttribute('d', exitD(sweep.b))

    const openCurtain = () => window.dispatchEvent(new Event('gt:curtain-open'))

    if (reduced) {
      gsap.set(panel, { yPercent: -100 })
      gsap.set([logo, count], { opacity: 0 })
      openCurtain()
      didMount.current = true
      return
    }

    const sweepOut = (delay = 0, duration = compact ? 0.48 : 0.9) => {
      sweep.b = 0
      drawExit()
      gsap.timeline({ delay, onStart: openCurtain })
        .fromTo(
          panel,
          { yPercent: 0 },
          { yPercent: -100, duration, ease: 'power3.inOut' },
          0
        )
        .to(
          sweep,
          {
            b: compact ? 12 : 22,
            duration: compact ? 0.18 : 0.32,
            ease: 'power2.in',
            onUpdate: drawExit,
          },
          0
        )
        .to(
          sweep,
          {
            b: 0,
            duration: compact ? 0.32 : 0.6,
            ease: 'power3.out',
            onUpdate: drawExit,
          },
          compact ? 0.18 : 0.32
        )
    }

    if (!didMount.current) {
      didMount.current = true
      const isFirstVisit = !sessionStorage.getItem('gt-loaded')

      if (isFirstVisit) {
        sessionStorage.setItem('gt-loaded', '1')
        const counter = { v: 0 }

        if (compact) {
          gsap.timeline()
            .fromTo(
              logo,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', delay: 0.06 }
            )
            .fromTo(
              count,
              { opacity: 0 },
              { opacity: 0.7, duration: 0.16, ease: 'power2.out' },
              '<'
            )
            .to(
              counter,
              {
                v: 100,
                duration: 0.52,
                ease: 'power2.inOut',
                onUpdate: () => {
                  count.textContent = String(Math.round(counter.v)).padStart(3, '0')
                },
              },
              '<0.04'
            )
            .to([logo, count], { opacity: 0, duration: 0.16, ease: 'power2.in' })
            .add(() => sweepOut())
        } else {
          gsap.timeline()
            .fromTo(
              logo,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.2 }
            )
            .fromTo(
              count,
              { opacity: 0 },
              { opacity: 1, duration: 0.4, ease: 'power2.out' },
              '<'
            )
            .to(
              counter,
              {
                v: 100,
                duration: 1.15,
                ease: 'power2.inOut',
                onUpdate: () => {
                  count.textContent = String(Math.round(counter.v)).padStart(3, '0')
                },
              },
              '<0.1'
            )
            .to(logo, { opacity: 0, y: -14, duration: 0.4, ease: 'power3.in', delay: 0.15 })
            .to(count, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '<')
            .add(() => sweepOut())
        }
      } else {
        sweepOut(compact ? 0 : 0.05)
      }
      return
    }

    sweepOut(compact ? 0 : 0.05)
  }, [pathname])

  useEffect(() => {
    const panel = panelRef.current
    const path = pathRef.current
    if (!panel || !path) return

    const compact = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sweep = sweepRef.current
    const drawEnter = () => path.setAttribute('d', enterD(sweep.b))

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.getAttribute('href') ?? ''
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('#')
      ) return

      const targetPath = href.split('?')[0]
      if (targetPath === window.location.pathname) return

      e.preventDefault()

      if (reduced) {
        router.push(href)
        return
      }

      gsap.killTweensOf(panel)
      gsap.killTweensOf(sweep)
      sweep.b = 0
      drawEnter()

      const duration = compact ? 0.36 : 0.6
      gsap.timeline()
        .fromTo(
          panel,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration,
            ease: 'power3.inOut',
            onComplete: () => router.push(href),
          },
          0
        )
        .to(
          sweep,
          {
            b: compact ? 10 : 20,
            duration: compact ? 0.14 : 0.22,
            ease: 'power2.out',
            onUpdate: drawEnter,
          },
          0
        )
        .to(
          sweep,
          {
            b: 0,
            duration: compact ? 0.26 : 0.5,
            ease: 'power3.inOut',
            onUpdate: drawEnter,
          },
          compact ? 0.14 : 0.22
        )
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [pathname, router])

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
