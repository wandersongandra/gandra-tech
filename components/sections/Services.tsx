'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Picture from '@/components/materia/Picture'
import MagneticButton from '@/components/motion/MagneticButton'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { services } from '@/lib/services'
import { getProject } from '@/lib/projects'
import { contactMailto } from '@/lib/site'
import { withGsap } from '@/lib/gsap'

/**
 * Serviços como um índice tipográfico. No hover (ponteiro fino) a linha é
 * preenchida de tinta por clip-path e uma prévia do case segue o cursor.
 * Em toque a prévia aparece ao lado da linha mais próxima do centro da
 * tela. Com reduced-motion some a prévia.
 */
export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const { ready, reduced, fine } = useMotionPrefs()

  useEffect(() => withGsap(({ gsap }) => {
    const section = sectionRef.current
    if (!section || !ready || reduced) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.m-services__row').forEach((row) => {
        gsap.from(row, {
          '--line': 0,
          yPercent: 30,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: row, start: 'top 92%', once: true },
        })
      })
    }, section)
    return () => ctx.revert()
  }), [ready, reduced])

  useEffect(() => withGsap(({ gsap }) => {
    const section = sectionRef.current
    const preview = previewRef.current
    if (!section || !preview || !ready || reduced) return
    const list = section.querySelector<HTMLElement>('.m-services__list')
    if (!list) return

    if (fine) {
      const xTo = gsap.quickTo(preview, 'x', { duration: 0.55, ease: 'power3.out' })
      const yTo = gsap.quickTo(preview, 'y', { duration: 0.55, ease: 'power3.out' })
      const rTo = gsap.quickTo(preview, 'rotation', { duration: 0.8, ease: 'power3.out' })
      let lastX = 0
      gsap.set(preview, { xPercent: -50, yPercent: -50 })
      const onMove = (e: PointerEvent) => {
        xTo(e.clientX)
        yTo(e.clientY)
        rTo(Math.max(-8, Math.min(8, (e.clientX - lastX) * 0.6)))
        lastX = e.clientX
      }
      const onOver = (e: PointerEvent) => {
        const row = (e.target as HTMLElement).closest<HTMLElement>('[data-preview]')
        const key = row?.dataset.preview ?? ''
        preview.querySelectorAll<HTMLElement>('[data-slug]').forEach((img) => {
          img.classList.toggle('is-current', img.dataset.slug === key)
        })
        preview.classList.toggle('is-visible', Boolean(key))
      }
      const onLeave = () => preview.classList.remove('is-visible')
      list.addEventListener('pointermove', onMove)
      list.addEventListener('pointerover', onOver)
      list.addEventListener('pointerleave', onLeave)
      return () => {
        list.removeEventListener('pointermove', onMove)
        list.removeEventListener('pointerover', onOver)
        list.removeEventListener('pointerleave', onLeave)
      }
    }

    // Toque: prévia ancorada pela borda direita (fica dentro da viewport).
    preview.classList.add('is-touch')
    // scale via GSAP (CSS scale + transform do GSAP brigavam e a prévia ficava a ~0.6).
    gsap.set(preview, { xPercent: -100, yPercent: -50, x: 0, y: 0, rotation: 0, scale: 1 })
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-preview]'))
    let current = ''
    let raf = 0
    const pick = () => {
      raf = 0
      const mid = window.innerHeight * 0.5
      let best: HTMLElement | null = null
      let bestDist = Infinity
      for (const row of rows) {
        const r = row.getBoundingClientRect()
        if (r.bottom < 60 || r.top > window.innerHeight - 40) continue
        const d = Math.abs(r.top + r.height / 2 - mid)
        if (d < bestDist) { bestDist = d; best = row }
      }
      const key = best?.dataset.preview ?? ''
      if (key !== current) {
        current = key
        preview.querySelectorAll<HTMLElement>('[data-slug]').forEach((img) => {
          img.classList.toggle('is-current', img.dataset.slug === key)
        })
        preview.classList.toggle('is-visible', Boolean(key))
        gsap.to(preview, { scale: key ? 1 : 0.85, duration: 0.45, ease: 'power3.out', overwrite: false })
      }
      if (best) {
        const r = best.getBoundingClientRect()
        // x = borda direita desejada; xPercent -100 empurra a prévia para dentro.
        const right = Math.min(window.innerWidth - 16, Math.max(16 + preview.offsetWidth, r.right - 12))
        gsap.to(preview, { y: r.top + r.height / 2, x: right, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick) }
    pick()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      preview.classList.remove('is-touch', 'is-visible')
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }), [ready, reduced, fine])

  const previews = Array.from(
    new Set(services.map((service) => service.relatedProjectSlug).filter(Boolean) as string[])
  )
    .map((slug) => getProject(slug))
    .filter((project): project is NonNullable<typeof project> => Boolean(project))

  return (
    <section id="servicos" ref={sectionRef} className="m-services" aria-labelledby="services-title">
      <div className="m-shell">
        <div className="m-section-head mono">
          <span>(01) Serviços</span>
          <span>Do primeiro rabisco ao produto no ar</span>
          <span aria-hidden="true">{String(services.length).padStart(2, '0')} frentes</span>
        </div>

        <div className="m-services__intro">
          <h2 id="services-title" className="m-display m-services__title">
            Sites, sistemas, automações e aplicações web para colocar negócios em{' '}
            <em className="m-italic">movimento.</em>
          </h2>
          <p className="m-services__desc">
            Experiências digitais para empresas, profissionais e empreendedores em todo o Brasil,
            com atendimento remoto e uma abordagem que conecta estratégia, design e engenharia.
          </p>
        </div>

        <ul className="m-services__list">
          {services.map((service, index) => (
            <li key={service.slug} className="m-services__row">
              <Link
                href={`/servicos/${service.slug}`}
                data-curtain={service.title}
                prefetch={false}
                className="m-services__link"
                data-preview={service.relatedProjectSlug ?? ''}
                data-cursor="Abrir"
              >
                <span className="m-services__index mono">{String(index + 1).padStart(2, '0')}</span>
                <span className="m-services__name">{service.title}</span>
                <span className="m-services__short">{service.shortDescription}</span>
                <span className="m-services__arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="m-services__preview" ref={previewRef} aria-hidden="true">
          {!reduced
            ? previews.map((project) => (
                <div key={project.slug} className="m-services__preview-img" data-slug={project.slug}>
                  <Picture src={project.workImage} alt="" sizes="320px" className="m-fill" />
                  <span className="m-services__preview-tag mono">{project.name}</span>
                </div>
              ))
            : null}
        </div>

        <div className="m-services__footer">
          <p className="m-services__footnote">Precisa tirar um projeto do papel?</p>
          <div className="m-services__ctas">
            <Link href="/servicos" prefetch={false} className="m-link">
              Conheça cada serviço <span aria-hidden="true">→</span>
            </Link>
            <MagneticButton strength={0.25}>
              <a href={contactMailto} className="m-button m-button--outline">
                <span className="m-button__label" data-text="Vamos conversar">Vamos conversar</span>
                <span className="m-button__icon" aria-hidden="true">↗</span>
              </a>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
