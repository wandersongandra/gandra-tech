'use client'
import { useEffect, useRef } from 'react'
import MagneticButton from '@/components/motion/MagneticButton'
import InkTrail from '@/components/motion/InkTrail'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { activeSocialLinks, contactEmail, contactMailto, contactNotes } from '@/lib/site'
import { withGsap } from '@/lib/gsap'

/**
 * Contato. O título sobe linha por linha, máscara por máscara, e o e-mail
 * é a ação principal — grande, magnético, sublinhado que se desenha.
 */
export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const { ready, reduced } = useMotionPrefs()

  useEffect(() => withGsap(({ gsap }) => {
    const section = sectionRef.current
    if (!section || !ready || reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.m-contact__line > span', {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      })
      gsap.from('.m-contact__col', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.m-contact__grid', start: 'top 90%', once: true },
      })
    }, section)
    return () => ctx.revert()
  }), [ready, reduced])

  return (
    <section ref={sectionRef} className="contact m-contact" aria-labelledby="contact-title">
      <span id="contato" className="m-anchor" />
      {/* "Trabalho bom deixa um rastro" — e o cursor deixa um, em nanquim. */}
      <InkTrail />
      <div className="m-shell m-contact__inner">
        <div className="m-section-head mono">
          <span>(05) Contato</span>
          <span>Vamos conversar</span>
          <span aria-hidden="true">2026</span>
        </div>
        <h2 id="contact-title" className="m-contact__title">
          <span className="m-contact__line">
            <span>Trabalho bom</span>
          </span>
          <span className="m-contact__line">
            <span>
              deixa um <em className="m-italic">rastro.</em>
            </span>
          </span>
        </h2>

        <div className="m-contact__grid">
          <div className="m-contact__col m-contact__col--main">
            <span className="contact__col-label m-label">Escreva para</span>
            <MagneticButton strength={0.15}>
              <a href={contactMailto} className="m-contact__email" data-cursor="Escrever" data-no-stain>
                {contactEmail}
                <span aria-hidden="true"> ↗</span>
              </a>
            </MagneticButton>
          </div>
          <div className="m-contact__col">
            <span className="contact__col-label m-label">Notas</span>
            <ul className="m-contact__notes">
              {contactNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          {activeSocialLinks.length > 0 && (
            <div className="m-contact__col">
              <span className="contact__col-label m-label">Por aí</span>
              <ul className="m-contact__notes">
                {activeSocialLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="m-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
