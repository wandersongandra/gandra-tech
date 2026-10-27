'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Hover de "papel molhado" nas imagens dos cartões de projeto: um filtro
 * SVG (feTurbulence + feDisplacementMap) entorta a foto por um instante,
 * como tinta que escorre, e assenta. Um único filtro para a página toda,
 * ligado por delegação de eventos. O filtro só fica aplicado durante a
 * onda (~0,9 s) — fora dela a imagem não paga custo nenhum.
 * Só com ponteiro fino e sem prefers-reduced-motion.
 */
export default function InkRipple() {
  const mapRef = useRef<SVGFEDisplacementMapElement>(null)
  const noiseRef = useRef<SVGFETurbulenceElement>(null)

  useEffect(() => {
    const map = mapRef.current
    const noise = noiseRef.current
    if (!map || !noise) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wave = { s: 0 }
    let current: HTMLImageElement | null = null
    let tween: gsap.core.Timeline | null = null

    const release = () => {
      if (current) current.style.removeProperty('filter')
      current = null
    }

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const card = (e.target as Element | null)?.closest?.('.project-card')
      if (!card || card.contains(e.relatedTarget as Node | null)) return
      const img = card.querySelector<HTMLImageElement>('.project-card__media img')
      if (!img) return
      tween?.kill()
      release()
      current = img
      noise.setAttribute('seed', String(Math.round(Math.random() * 999)))
      img.style.filter = 'url(#m-ink-ripple)'
      tween = gsap
        .timeline({ onComplete: release })
        .fromTo(wave, { s: 0 }, { s: 46, duration: 0.28, ease: 'power2.out', onUpdate: () => map.setAttribute('scale', wave.s.toFixed(1)) })
        .to(wave, { s: 0, duration: 0.7, ease: 'power3.out', onUpdate: () => map.setAttribute('scale', wave.s.toFixed(1)) })
    }

    document.addEventListener('pointerover', onOver)
    return () => {
      document.removeEventListener('pointerover', onOver)
      tween?.kill()
      release()
    }
  }, [])

  return (
    <svg className="m-svg-defs" aria-hidden="true" focusable="false" width="0" height="0">
      <filter id="m-ink-ripple" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feTurbulence ref={noiseRef} type="fractalNoise" baseFrequency="0.008 0.022" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap ref={mapRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}
