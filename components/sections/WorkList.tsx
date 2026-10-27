'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Picture from '@/components/materia/Picture'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { previewImage, projects, siteDomain } from '@/lib/projects'
import { withGsap } from '@/lib/gsap'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Trabalhos selecionados — índice tipográfico, como o sumário de uma revista:
 * número, nome grande, tipo, ano e o endereço do site no ar. A linha inteira
 * leva ao case (/trabalhos/<slug>); o convite para abrir o site do cliente
 * fica dentro do case. Sem fotos soltas na home.
 *
 * Movimento: as linhas entram por fios que se desenham. Com ponteiro fino a
 * prévia do site acompanha o cursor; em toque a prévia aparece quando a
 * linha passa pelo centro da tela (sem hover). Com reduced-motion some.
 */
export default function WorkList() {
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const { ready, reduced, fine } = useMotionPrefs()

  // Entrada das linhas (fio + texto). Conteúdo nunca depende disso.
  useEffect(() => withGsap(({ gsap }) => {
    const list = listRef.current
    if (!list || !ready || reduced) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.work-row', list).forEach((row, i) => {
        const rule = row.querySelector('.work-row__rule')
        const cells = row.querySelectorAll('.work-row__cell')
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 92%', once: true } })
        if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'expo.out', delay: i * 0.04 })
        tl.fromTo(cells, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05, clearProps: 'transform,opacity' }, '<0.08')
      })
    }, list)
    return () => ctx.revert()
  }), [ready, reduced])

  // A seção não tem mais pin; o aviso continua para quem espera o layout final.
  useEffect(() => {
    if (ready) window.dispatchEvent(new Event('gt:works-ready'))
  }, [ready])

  // Prévia: no desktop segue o cursor; no toque a linha mais próxima do
  // centro da tela ganha a prévia (sem hover e sem gesto extra).
  useEffect(() => {
    const list = listRef.current
    if (!list || !ready || reduced) return
    if (fine) {
      let raf = 0
      let x = 0
      let y = 0
      const move = (e: PointerEvent) => {
        const row = (e.target as Element | null)?.closest?.<HTMLElement>('.work-row__link')
        if (!row) return
        const r = row.getBoundingClientRect()
        x = e.clientX - r.left
        y = e.clientY - r.top
        if (raf) return
        raf = requestAnimationFrame(() => {
          raf = 0
          row.style.setProperty('--peek-x', `${x.toFixed(1)}px`)
          row.style.setProperty('--peek-y', `${y.toFixed(1)}px`)
        })
      }
      list.classList.add('is-following')
      list.addEventListener('pointermove', move, { passive: true })
      return () => {
        cancelAnimationFrame(raf)
        list.classList.remove('is-following')
        list.removeEventListener('pointermove', move)
      }
    }
    const links = Array.from(list.querySelectorAll<HTMLElement>('.work-row__link'))
    let current: HTMLElement | null = null
    let raf = 0
    const pick = () => {
      raf = 0
      const mid = window.innerHeight * 0.48
      let best: HTMLElement | null = null
      let bestDist = Infinity
      for (const link of links) {
        const r = link.getBoundingClientRect()
        if (r.bottom < 80 || r.top > window.innerHeight - 40) continue
        const dist = Math.abs(r.top + r.height / 2 - mid)
        if (dist < bestDist) {
          bestDist = dist
          best = link
        }
      }
      if (best !== current) {
        current?.classList.remove('is-peek')
        current = best
        current?.classList.add('is-peek')
      }
      // Recalcula posição também no resize (mesma linha pode continuar selecionada).
      if (current) {
        const r = current.getBoundingClientRect()
        // CSS: translateX(peek-x + 28). Largura touch = min(68vw, 280).
        const peekW = Math.min(window.innerWidth * 0.68, 280)
        const maxX = window.innerWidth - r.left - peekW - 28 - 12
        const peekX = Math.max(8, Math.min(r.width * 0.42, maxX))
        current.style.setProperty('--peek-x', `${peekX.toFixed(1)}px`)
        current.style.setProperty('--peek-y', `${(r.height * 0.55).toFixed(1)}px`)
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(pick)
    }
    list.classList.add('is-touch-peek')
    pick()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      list.classList.remove('is-touch-peek')
      current?.classList.remove('is-peek')
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ready, reduced, fine])

  return (
    <>
    <section id="trabalhos" ref={sectionRef} className="work-list m-works" aria-labelledby="works-title">
      <div className="m-shell m-works__head">
        <div className="m-section-head mono">
          <span>(02) Trabalhos selecionados</span>
          <span>Cada case reúne contexto, decisões de projeto e o site no ar.</span>
          <span className="work-list__aside">
            <span className="work-list__count">({pad(projects.length)})</span>
          </span>
        </div>
        <div className="m-works__title-row">
          <h2 id="works-title" className="m-display m-works__title">
            Projetos com <em className="m-italic">direção</em> e código.
          </h2>
          <Link href="/trabalhos" prefetch={false} className="m-link work-list__archive" data-cursor="Arquivo">
            Ver arquivo completo <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <ol ref={listRef} className="work-rows" aria-label="Projetos selecionados">
          {projects.map((project, index) => {
            const domain = siteDomain(project)
            return (
              <li key={project.slug} className="work-row">
                <span className="work-row__rule" aria-hidden="true" />
                <Link
                  href={`/trabalhos/${project.slug}`}
                  prefetch={false}
                  className="work-row__link"
                  data-curtain={project.name}
                  data-cursor="Ver case"
                >
                  <span className="work-row__cell work-row__num mono" aria-hidden="true">
                    {pad(index + 1)}
                    <span className="work-row__total">/{pad(projects.length)}</span>
                  </span>
                  <span className="work-row__cell work-row__name">
                    <span className="work-row__name-text">{project.name}</span>
                  </span>
                  <span className="work-row__cell work-row__type mono">{project.category}</span>
                  <span className="work-row__cell work-row__year mono">{project.year}</span>
                  <span className="work-row__cell work-row__domain mono">
                    {domain ? (
                      <>
                        <span className="sr-only">Site no ar: </span>
                        {domain}
                      </>
                    ) : (
                      <span className="work-row__private">{project.accessNote ?? 'Case completo'}</span>
                    )}
                  </span>
                  <span className="work-row__cell work-row__go mono">
                    <span className="work-row__go-label">Ver case</span>
                    <span aria-hidden="true"> →</span>
                  </span>
                  {!reduced ? (
                    <span className="work-row__peek" aria-hidden="true">
                      <Picture src={previewImage(project)} alt="" sizes="360px" className="m-fill" focus="50% 0%" />
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
    {/* Fase 5: mergulho num ponto da retícula até a próxima seção. Só
        decoração (aria-hidden); com reduced-motion vira uma faixa vermelha. */}
    <div className="m-dive" aria-hidden="true">
      <div className="m-dive__stage">
        <span className="m-dive__dot" />
        <span className="m-dive__flood" />
        <span className="m-dive__cap mono">Ampliação 80× · ponto de retícula</span>
      </div>
    </div>
    </>
  )
}
