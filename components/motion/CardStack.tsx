'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getReducedMotionQuery } from './reducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Cartas empilhadas: as seções marcadas com .stack-card ficam grudadas no
 * topo (CSS) enquanto o conteúdo seguinte desliza por cima; aqui, a seção
 * coberta encolhe e escurece, como uma carta indo para o fundo do monte.
 * Também garante a ordem de empilhamento (z-index) entre as seções.
 */
export default function CardStack() {
  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const motionQuery = getReducedMotionQuery()
    let cleanupStack: (() => void) | null = null

    const resetCards = () => {
      const all = document.querySelectorAll<HTMLElement>('main > section')
      const cards = document.querySelectorAll<HTMLElement>('.stack-card')

      all.forEach((s) => {
        s.style.position = ''
        s.style.zIndex = ''
      })
      cards.forEach((card) => {
        card.style.visibility = ''
        const target = card.querySelector<HTMLElement>('[data-stack-inner]') ?? card
        gsap.killTweensOf(target)
        gsap.set(target, { scale: 1, filter: 'none', clearProps: 'transform,filter' })
      })
    }

    const setup = () => {
      cleanupStack?.()
      cleanupStack = null

      if (!desktopQuery.matches || motionQuery.matches) {
        resetCards()
        return
      }

      // z-index crescente: o que vem depois sempre cobre o que está preso.
      const all = document.querySelectorAll<HTMLElement>('main > section')
      all.forEach((s, i) => {
        s.style.position = s.classList.contains('stack-card') ? '' : 'relative'
        s.style.zIndex = String(i + 1)
      })

      const cards = gsap.utils.toArray<HTMLElement>('.stack-card')
      const tweens = cards.map((card) => {
        // Se a seção tem uma camada [data-stack-inner], o encolhimento acontece
        // nela e não na seção — assim o fundo da seção segue full-bleed e as
        // frestas laterais não revelam o que está atrás (hero preto sobre
        // página clara).
        const target = card.querySelector<HTMLElement>('[data-stack-inner]') ?? card
        card.style.visibility = ''
        return gsap.fromTo(
          target,
          { scale: 1, filter: 'brightness(1)' },
          {
            scale: 0.93,
            filter: 'brightness(0.5)',
            transformOrigin: 'center top',
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top top',
              end: '+=90%',
              scrub: true,
            },
          }
        )
      })

      // O sticky dura até o fim do <main>: sem esta guarda, a carta coberta
      // volta a aparecer nas frestas entre as seções seguintes. Quando a
      // próxima seção "inteira" (marquees finos não cobrem) a esconde por
      // completo, ela se aposenta.
      const watchers: ScrollTrigger[] = []
      cards.forEach((card) => {
        let cover = card.nextElementSibling
        while (cover && cover.classList.contains('marquee')) {
          cover = cover.nextElementSibling
        }
        if (!cover) return
        watchers.push(
          ScrollTrigger.create({
            trigger: cover,
            start: 'top top',
            onEnter: () => {
              card.style.visibility = 'hidden'
            },
            onLeaveBack: () => {
              card.style.visibility = ''
            },
          })
        )
      })

      cleanupStack = () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill()
          t.kill()
        })
        watchers.forEach((w) => w.kill())
        resetCards()
      }
    }

    setup()
    desktopQuery.addEventListener('change', setup)
    motionQuery.addEventListener('change', setup)

    return () => {
      desktopQuery.removeEventListener('change', setup)
      motionQuery.removeEventListener('change', setup)
      cleanupStack?.()
    }
  }, [])

  return null
}
