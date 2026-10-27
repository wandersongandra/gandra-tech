'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotionPrefs } from './useMotion'

/**
 * Coreografia da página de case, ligada por atributos data-* do markup de
 * servidor (ProjectView não precisa virar componente de cliente):
 * - [data-plate] [data-depth]: camadas do hero em velocidades diferentes;
 * - [data-reveal]: a moldura abre por clip-path e a foto assenta (scale);
 * - [data-scrub]: as palavras acendem conforme a leitura;
 * - .m-case__shots: inclinação proporcional à velocidade do scroll;
 * - .m-case__next: carrega a foto das letras só perto da viewport e, no
 *   toque, liga o efeito quando o link chega ao centro da tela.
 * Com prefers-reduced-motion nada disso roda — tudo fica no estado final.
 */
export default function CaseMotion() {
  const { ready, reduced, fine } = useMotionPrefs()

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-case-root]')
    if (!root) return

    // Foto do "próximo case": só busca a imagem quando o link se aproxima.
    const next = root.querySelector<HTMLElement>('.m-case__next')
    let io: IntersectionObserver | null = null
    if (next) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            next.classList.add('is-near')
            io?.disconnect()
          }
        },
        { rootMargin: '600px 0px' }
      )
      io.observe(next)
    }

    if (!ready || reduced) return () => io?.disconnect()

    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const plate = root.querySelector<HTMLElement>('[data-plate]')
      if (plate) {
        plate.querySelectorAll<HTMLElement>('[data-depth]').forEach((layer) => {
          const depth = Number(layer.dataset.depth) || 0
          gsap.fromTo(
            layer,
            { yPercent: -depth * 50 },
            {
              yPercent: depth * 50,
              ease: 'none',
              scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          )
        })
      }

      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((frame) => {
        const img = frame.querySelector('img')
        const tl = gsap.timeline({
          scrollTrigger: { trigger: frame, start: 'top 92%', end: 'top 38%', scrub: 0.6 },
        })
        tl.fromTo(
          frame,
          { clipPath: 'inset(16% 10% 16% 10%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' },
          0
        )
        if (img) tl.fromTo(img, { scale: 1.22 }, { scale: 1, ease: 'none' }, 0)
      })

      root.querySelectorAll<HTMLElement>('[data-scrub]').forEach((p) => {
        const words = p.querySelectorAll('.m-scrub__w')
        gsap.fromTo(
          words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 52%', scrub: true },
          }
        )
      })

      // Inclinação por velocidade: a galeria "arrasta" levemente com o scroll.
      const shots = root.querySelectorAll<HTMLElement>('.m-case__shot')
      if (shots.length && fine) {
        const skewTo = gsap.quickTo(shots, 'skewY', { duration: 0.5, ease: 'power3.out' })
        ScrollTrigger.create({
          trigger: root.querySelector('.m-case__shots'),
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => skewTo(gsap.utils.clamp(-3.5, 3.5, self.getVelocity() / -420)),
          onLeave: () => skewTo(0),
          onLeaveBack: () => skewTo(0),
        })
      }

      if (next && !fine) {
        ScrollTrigger.create({
          trigger: next,
          start: 'top 65%',
          end: 'bottom 35%',
          toggleClass: 'is-active',
        })
      }
    }, root)

    return () => {
      io?.disconnect()
      ctx.revert()
    }
  }, [ready, reduced, fine])

  return null
}
