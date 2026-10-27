'use client'
import { useEffect, useRef } from 'react'
import { useMotionPrefs } from './useMotion'

type Props = {
  text: string
  className?: string
  /** Progresso externo 0..1 (ex.: scroll) que comprime a palavra. */
  progressVar?: string
}

/**
 * Assinatura do sistema "Matéria": a palavra é feita de matéria tipográfica.
 * Cada letra usa os eixos variáveis da Archivo (largura 62–125, peso
 * 100–900) e reage à proximidade do cursor — perto dele a letra ganha
 * massa e se alarga, longe ela se comprime. O conjunto é reajustado com
 * scaleX para ocupar sempre a largura exata do contêiner. Com JS as letras
 * saem do fluxo e são posicionadas só por transform — sem layout shift nem
 * overflow.
 *
 * Toque: uma onda lenta percorre as letras enquanto a seção está visível.
 * prefers-reduced-motion: nada se move; fica o desenho estático.
 */
export default function KineticWordmark({ text, className }: Props) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const { ready, reduced, fine } = useMotionPrefs()

  useEffect(() => {
    const root = rootRef.current
    const inner = innerRef.current
    if (!root || !inner || !ready) return

    const letters = Array.from(inner.querySelectorAll<HTMLSpanElement>('[data-letter]'))
    const REST = { wdth: 100, wght: 640 }

    const fit = () => {
      // scrollWidth ignora o transform do próprio elemento: uma leitura só.
      const scale = root.clientWidth / Math.max(1, inner.scrollWidth)
      inner.style.transform = `scaleX(${scale.toFixed(4)})`
    }

    if (reduced) {
      for (const el of letters) el.style.fontVariationSettings = `"wdth" ${REST.wdth}, "wght" ${REST.wght}`
      fit()
      const ro = new ResizeObserver(fit)
      ro.observe(root)
      return () => ro.disconnect()
    }

    // Tira as letras do fluxo: cada uma passa a ser posicionada só por
    // transform. Assim a largura variável não move caixas de layout (CLS 0).
    const masks = letters.map((el) => el.parentElement as HTMLSpanElement)
    const letterH0 = Math.max(1, letters[0]?.offsetHeight ?? 1)
    const topRatio =
      (masks[0].getBoundingClientRect().top - root.getBoundingClientRect().top) / letterH0
    const heightRatio = root.offsetHeight / letterH0
    const applyBox = () => {
      const h = letters[0]?.offsetHeight ?? letterH0
      root.style.height = `${(h * heightRatio).toFixed(2)}px`
      root.style.setProperty('--k-top', `${(h * topRatio).toFixed(2)}px`)
    }
    root.classList.add('is-free')
    applyBox()
    const place = () => {
      let x = 0
      for (const mask of masks) {
        mask.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`
        x += mask.offsetWidth
      }
      const scale = root.clientWidth / Math.max(1, x)
      inner.style.transform = `scaleX(${scale.toFixed(4)})`
    }
    place()

    const state = letters.map(() => ({ wdth: REST.wdth, wght: REST.wght }))
    const pointer = { x: -1, active: false }
    let visible = true
    let raf = 0
    let start = performance.now()
    let squeeze = 0 // 0..1 vindo do scroll: comprime a palavra ao sair

    const centers = () => {
      const r = root.getBoundingClientRect()
      return letters.map((_, i) => r.left + ((i + 0.5) / letters.length) * r.width)
    }
    let cached = centers()

    let lastFrame = 0
    const tick = (now: number) => {
      raf = 0
      if (!visible) return
      // Em toque a onda roda a ~30 fps para poupar bateria.
      if (!fine && now - lastFrame < 32) {
        raf = requestAnimationFrame(tick)
        return
      }
      lastFrame = now
      const vw = window.innerWidth
      const sigma = vw * 0.13
      let moving = false
      letters.forEach((el, i) => {
        let f: number
        if (fine && pointer.active) {
          const d = (pointer.x - cached[i]) / sigma
          f = Math.exp(-d * d)
        } else {
          // Onda lenta para toque e para quando o cursor está fora.
          const t = (now - start) / 1000
          f = 0.5 + 0.5 * Math.sin(t * 1.15 - i * 0.75)
          f = f * f * 0.85
        }
        const targetW = (62 + f * 63) * (1 - squeeze * 0.35)
        const targetG = 260 + f * 640 - squeeze * 120
        const s = state[i]
        s.wdth += (targetW - s.wdth) * 0.14
        s.wght += (targetG - s.wght) * 0.14
        if (Math.abs(targetW - s.wdth) > 0.2 || Math.abs(targetG - s.wght) > 1) moving = true
        el.style.fontVariationSettings = `"wdth" ${s.wdth.toFixed(1)}, "wght" ${Math.round(s.wght)}`
      })
      place()
      // Com cursor parado, o loop dorme até o próximo movimento.
      if (moving || !(fine && pointer.active)) raf = requestAnimationFrame(tick)
    }
    // Em toque a onda só começa depois do carregamento: a primeira pintura
    // e a hidratação não disputam CPU com o layout dos eixos variáveis.
    let armed = fine
    const wake = () => {
      if (armed && !raf && visible) raf = requestAnimationFrame(tick)
    }
    let armTimer = 0
    const arm = () => {
      armTimer = window.setTimeout(() => {
        armed = true
        start = performance.now()
        wake()
      }, 1200)
    }
    if (!armed) {
      if (document.readyState === 'complete') arm()
      else window.addEventListener('load', arm, { once: true })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      pointer.x = e.clientX
      pointer.active = true
      wake()
    }
    const onLeave = () => {
      pointer.active = false
      start = performance.now()
      wake()
    }
    const onResize = () => {
      applyBox()
      place()
      cached = centers()
      wake()
    }
    const onScroll = () => {
      const r = root.getBoundingClientRect()
      squeeze = Math.min(1, Math.max(0, 1 - r.bottom / window.innerHeight)) * 0.9
      cached = centers()
      wake()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        cached = centers()
        wake()
      }
    })
    io.observe(root)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
      if (visible) wake()
    }
    document.addEventListener('visibilitychange', onVisibility)
    wake()

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(armTimer)
      window.removeEventListener('load', arm)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      root.classList.remove('is-free')
      root.style.removeProperty('height')
      root.style.removeProperty('--k-top')
      inner.style.removeProperty('transform')
      for (const mask of masks) mask.style.removeProperty('transform')
    }
  }, [ready, reduced, fine])

  return (
    <span ref={rootRef} className={`kinetic ${className ?? ''}`} aria-hidden="true">
      <span ref={innerRef} className="kinetic__inner">
        {Array.from(text).map((char, index) => (
          <span key={`${char}-${index}`} className="kinetic__mask">
            <span data-letter className="kinetic__letter" style={{ '--i': index } as React.CSSProperties}>
              {char}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}
