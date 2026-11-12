'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { projects } from '@/lib/projects'
import { useMotionPrefs } from '@/components/motion/useMotion'
import { withGsap } from '@/lib/gsap'

/**
 * Faixa com as marcas reais dos projetos do portfólio (lib/projects). O trilho roda em
 * CSS; a velocidade e o sentido seguem o scroll (GSAP só ajusta o
 * playbackRate da animação CSS e a inclinação dos separadores). As marcas
 * não são deformadas. Apenas a primeira
 * sequência entra na ordem de foco; as repetições mantêm o loop visual.
 */
const logos: Record<string, { src: string; width: number; height: number; tone?: 'dark' }> = {
  sgs: { src: '/images/project-logos/sgs.svg', width: 1000, height: 460 },
  'telma-santos': { src: '/images/project-logos/telma-santos.webp', width: 700, height: 403, tone: 'dark' },
  'gisley-nunes-imoveis': { src: '/images/project-logos/gisley-nunes.jpeg', width: 455, height: 92 },
  'ajn-consultoria-engenharia': { src: '/images/project-logos/ajn.webp', width: 639, height: 640 },
  'laboratorio-dental-araujo': { src: '/images/project-logos/laboratorio-dental-araujo.png', width: 453, height: 96 },
}

export default function ClientMarquee() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { ready, reduced } = useMotionPrefs()

  useEffect(() => withGsap(({ gsap, ScrollTrigger }) => {
    const track = trackRef.current
    if (!track || !ready || reduced) return
    const animation = track.getAnimations()[0]
    if (!animation) return
    let direction = 1
    let settle: gsap.core.Tween | null = null
    const proxy = { rate: 1, skew: 0 }
    const apply = () => {
      animation.playbackRate = proxy.rate * direction
      track.style.setProperty('--skew', `${proxy.skew.toFixed(2)}deg`)
    }
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        direction = self.direction
        const v = Math.min(Math.abs(self.getVelocity()) / 400, 5)
        proxy.rate = 1 + v
        proxy.skew = Math.max(-6, Math.min(6, self.getVelocity() / -300))
        apply()
        settle?.kill()
        settle = gsap.to(proxy, { rate: 1, skew: 0, duration: 0.9, ease: 'power3.out', onUpdate: apply })
      },
    })
    return () => {
      st.kill()
      settle?.kill()
      animation.playbackRate = 1
    }
  }), [ready, reduced])

  return (
    <section className="m-clients" aria-labelledby="clients-title">
      <div className="m-clients__head mono">
        <h2 id="clients-title" className="m-clients__title">Projetos publicados</h2>
        <div className="m-clients__head-right">
          <span aria-hidden="true">({String(projects.length).padStart(2, '0')})</span>
          <Link href="/trabalhos" className="m-clients__all">Ver os projetos <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <div className="m-clients__viewport">
        <div ref={trackRef} className="m-clients__track">
          {[0, 1, 2, 3].map((copy) => (
            <div className="m-clients__group" key={copy} aria-hidden={copy > 0 ? true : undefined}>
              {projects.map((project) => (
                <div className="m-clients__item" key={`${copy}-${project.slug}`}>
                  <Link
                    href={`/trabalhos/${project.slug}`}
                    className="m-clients__link"
                    aria-label={`Conhecer o projeto ${project.name}`}
                    tabIndex={copy === 0 ? undefined : -1}
                  >
                    <span className={`m-clients__logo-surface${logos[project.slug]?.tone === 'dark' ? ' m-clients__logo-surface--dark' : ''}`}>
                      {logos[project.slug] ? (
                        <Image
                          className="m-clients__logo"
                          src={logos[project.slug].src}
                          alt={`${project.name} — marca do projeto`}
                          width={logos[project.slug].width}
                          height={logos[project.slug].height}
                          loading="lazy"
                          sizes="(max-width: 640px) 220px, 275px"
                        />
                      ) : (
                        <span className="m-clients__fallback">{project.name}</span>
                      )}
                    </span>
                    <span className="m-clients__label">{project.name}</span>
                  </Link>
                  <span className="m-clients__star" aria-hidden="true">✳</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
