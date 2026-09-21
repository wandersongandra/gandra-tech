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
  /** Segundos para um grupo cruzar a tela na velocidade de repouso. */
  speed?: number
}

/**
 * Marquee dirigido pelo scroll: a velocidade base é constante, mas rolar
 * rápido empurra a faixa — para baixo acelera num sentido, para cima freia
 * e até inverte. O mouse parado sobre a faixa a desacelera suavemente.
 */
export default function Marquee({ inverted = false, speed = 32 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    const group = groupRef.current
    if (!root || !track || !group) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const compact = window.matchMedia('(max-width: 767px)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (reduceMotion || compact || coarsePointer) return

    let width = group.offsetWidth
    const measure = () => {
      width = group.offsetWidth
    }
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)

    // Estado do loop.
    let pos = 0
    let velSmooth = 0 // velocidade do scroll suavizada (px/s)
    let hoverFactor = 1 // 1 = andando, 0 = parado (hover)
    let lastY = window.scrollY
    let lastT = performance.now()

    const onEnter = () => {
      hoverFactor = 0
    }
    const onLeave = () => {
      hoverFactor = 1
    }
    root.addEventListener('mouseenter', onEnter)
    root.addEventListener('mouseleave', onLeave)

    // Direção de repouso: normal para a esquerda, invertido para a direita.
    const dir = inverted ? 1 : -1
    let currentSpeedFactor = 1

    let raf = requestAnimationFrame(function tick(now) {
      const dt = Math.min((now - lastT) / 1000, 0.05)
      lastT = now

      // Velocidade instantânea do scroll (o Lenis rola a window nativa).
      const y = window.scrollY
      const rawVel = dt > 0 ? (y - lastY) / dt : 0
      lastY = y
      velSmooth += (rawVel - velSmooth) * 0.1

      // Aproxima o fator de velocidade do alvo (hover pausa com suavidade).
      currentSpeedFactor += (hoverFactor - currentSpeedFactor) * 0.08

      const base = width / speed // px/s em repouso
      // O scroll empurra a faixa: |vel| alta vira o próprio deslocamento,
      // então rolar rápido para cima pode vencer a base e inverter o sentido.
      const push = velSmooth * 0.12 * (inverted ? -1 : 1)
      pos += (dir * base * currentSpeedFactor + push * currentSpeedFactor) * dt
      pos = gsap.utils.wrap(-width, 0, pos)
      track.style.transform = `translate3d(${pos}px, 0, 0)`

      raf = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(raf)
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
