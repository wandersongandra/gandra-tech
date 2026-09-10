'use client'
import { useRef, useEffect } from 'react'
import WordReveal from '@/components/motion/WordReveal'
import FadeIn from '@/components/motion/FadeIn'
import MagneticButton from '@/components/motion/MagneticButton'
import ScrambleText from '@/components/motion/ScrambleText'
import { activeSocialLinks, contactEmail, contactNotes } from '@/lib/site'

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(max-width: 767px), (pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect()
      section.style.setProperty('--mx', `${e.clientX - r.left}px`)
      section.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    section.addEventListener('mousemove', onMove)
    return () => section.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section ref={sectionRef} className="contact">
      <div className="contact__secret" aria-hidden="true">
        Detalhes criam memória.
      </div>
      <div className="container">
        <div className="section-label section-label--dark">
          <ScrambleText text="CONTATO" speed={3} />
          <span>2026</span>
        </div>
        <span id="contato" style={{ display: 'block', height: 0 }} />
        <WordReveal
          as="h2"
          className="contact__title"
          y={36}
          blur={10}
          stagger={0.07}
          duration={0.9}
        >
          Trabalho bom deixa um rastro.
        </WordReveal>
        <div className="contact__grid">
          <div className="contact__col contact__col--main">
            <FadeIn as="div" className="contact__col-label contact__col-label--accent" y={16} duration={0.6}>
              VAMOS CONVERSAR
            </FadeIn>
            <FadeIn y={30} scale={0.96} duration={0.85} delay={0.12}>
              <MagneticButton>
                <a href={`mailto:${contactEmail}`} className="contact__email">
                  {contactEmail} ↗
                </a>
              </MagneticButton>
            </FadeIn>
          </div>
          <div className="contact__col">
            <FadeIn as="div" className="contact__col-label" y={16} duration={0.6} delay={0.08}>
              NOTAS
            </FadeIn>
            <div className="contact__notes">
              {contactNotes.map((note, i) => (
                <FadeIn key={note} as="div" y={18} duration={0.6} delay={0.18 + i * 0.1}>
                  {note}
                </FadeIn>
              ))}
            </div>
          </div>
          {activeSocialLinks.length > 0 && (
            <div className="contact__col">
              <FadeIn as="div" className="contact__col-label" y={16} duration={0.6} delay={0.16}>
                POR AÍ
              </FadeIn>
              <div className="contact__links">
                {activeSocialLinks.map((link, i) => (
                  <FadeIn key={link.label} y={18} duration={0.6} delay={0.26 + i * 0.08}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact__social-link"
                    >
                      {link.label}
                    </a>
                  </FadeIn>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
