'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const items = [
  'PRODUTO',
  'IDENTIDADE',
  'MOTION',
  'ENGENHARIA WEB',
  'UX / UI',
  'ESTRATÉGIA DIGITAL',
  'DESIGN DE SISTEMA',
  'MOBILE',
  'MARCA',
  'PERFORMANCE',
]

function Group({ refProp }: { refProp?: React.Ref<HTMLSpanElement> }) {
  return (
    <span ref={refProp} className="marquee__group" aria-hidden>
      {items.map((item, i) => (
        <span key={i} className="marquee__item">
          {item}&nbsp;&nbsp;<span className="marquee__sep">·</span>&nbsp;&nbsp;
        </span>
      ))}
    </span>
  )
}

interface Props {
  inverted?: boolean
  speed?: number
}

export default function Marquee({ inverted = false, speed = 32 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    const group = groupRef.current
    if (!root || !track || !group) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let width = group.offsetWidth
    const measure = () => {
      width = group.offsetWidth
    }
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)

    let pos = 0
    let velSmooth = 0
    let hoverFactor = 1
    let lastY = window.scrollY
    let lastT = performance.now()
    let currentSpeedFactor = 1
    let raf = 0
    let active = false
    let pageVisible = document.visibilityState === 'visible'

    const onEnter = () => {
      hoverFactor = 0
    }
    const onLeave = () => {
      hoverFactor = 1
    }
    root.addEventListener('mouseenter', onEnter)
    root.addEventListener('mouseleave', onLeave)

    const dir = inverted ? 1 : -1

    const tick = (now: number) => {
      if (!active || !pageVisible) {
        raf = 0
        return
      }

      const dt = Math.min((now - lastT) / 1000, 0.05)
      lastT = now

      const y = window.scrollY
      const rawVel = dt > 0 ? (y - lastY) / dt : 0
      lastY = y
      velSmooth += (rawVel - velSmooth) * 0.1
      currentSpeedFactor += (hoverFactor - currentSpeedFactor) * 0.08

      const base = width / speed
      const push = velSmooth * 0.12 * (inverted ? -1 : 1)
      pos += (dir * base * currentSpeedFactor + push * currentSpeedFactor) * dt
      pos = gsap.utils.wrap(-width, 0, pos)
      track.style.transform = `translate3d(${pos}px, 0, 0)`

      raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const start = () => {
      if (raf || !active || !pageVisible) return
      lastY = window.scrollY
      lastT = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting
        if (active) start()
        else stop()
      },
      { rootMargin: '45% 0px 45% 0px' }
    )
    observer.observe(root)

    const onVisibilityChange = () => {
      pageVisible = document.visibilityState === 'visible'
      if (pageVisible) start()
      else stop()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      stop()
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('resize', measure)
      root.removeEventListener('mouseenter', onEnter)
      root.removeEventListener('mouseleave', onLeave)
    }
  }, [inverted, speed])

  return (
    <div ref={rootRef} className={`marquee${inverted ? ' marquee--inv' : ''}`}>
      <div ref={trackRef} className="marquee__track">
        <Group refProp={groupRef} />
        <Group />
      </div>
    </div>
  )
}
