'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ImageFill from '@/components/motion/ImageFill'
import MagneticButton from '@/components/motion/MagneticButton'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { services } from '@/lib/services'
import { getProject } from '@/lib/projects'
import { contactMailto } from '@/lib/site'

gsap.registerPlugin(ScrollTrigger)

/**
 * Serviços como um índice tipográfico. No hover (ponteiro fino) a linha é
 * preenchida de tinta por clip-path e uma prévia com a imagem real do case
 * relacionado segue o cursor. Em toque e em movimento reduzido fica só a
 * lista, legível e completa.
 */
export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const { ready, reduced, fine } = useMotionPrefs()

  useEffect(() => {
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
  }, [ready, reduced])

  useEffect(() => {
    const section = sectionRef.current
    const preview = previewRef.current
    if (!section || !preview || !ready || reduced || !fine) return
    const xTo = gsap.quickTo(preview, 'x', { duration: 0.55, ease: 'power3.out' })
    const yTo = gsap.quickTo(preview, 'y', { duration: 0.55, ease: 'power3.out' })
    const rTo = gsap.quickTo(preview, 'rotation', { duration: 0.8, ease: 'power3.out' })
    let lastX = 0
    const list = section.querySelector<HTMLElement>('.m-services__list')
    if (!list) return
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
    const onLeave = () => {
      preview.classList.remove('is-visible')
    }
    list.addEventListener('pointermove', onMove)
    list.addEventListener('pointerover', onOver)
    list.addEventListener('pointerleave', onLeave)
    return () => {
      list.removeEventListener('pointermove', onMove)
      list.removeEventListener('pointerover', onOver)
      list.removeEventListener('pointerleave', onLeave)
    }
  }, [ready, reduced, fine])

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
          {fine && !reduced
            ? previews.map((project) => (
                <div key={project.slug} className="m-services__preview-img" data-slug={project.slug}>
                  <ImageFill
                    src={project.workImage}
                    alt=""
                    sizes="320px"
                    objectPosition="center"
                    fallback={<span />}
                  />
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
