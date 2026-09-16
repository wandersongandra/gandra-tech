'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import FadeIn from '@/components/motion/FadeIn'
import WordReveal from '@/components/motion/WordReveal'
import ScrambleText from '@/components/motion/ScrambleText'
import ImageFill from '@/components/motion/ImageFill'
import DrawArrow from '@/components/motion/DrawArrow'
import { projects } from '@/lib/projects'

// Arquivo editorial de projetos: lista compacta em fundo preto, com
// miniatura que desperta no hover. Contrasta com o trilho cinematográfico
// da home — aqui o foco é navegação rápida e indexação.
export default function WorkIndex() {
  const [renderThumbnails, setRenderThumbnails] = useState(false)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 768px)')
    const sync = () => setRenderThumbnails(desktopQuery.matches)

    sync()
    desktopQuery.addEventListener('change', sync)

    return () => desktopQuery.removeEventListener('change', sync)
  }, [])

  return (
    <section className="windex">
      <div className="container">
        <FadeIn as="div" className="section-label section-label--dark" trigger="load" y={12} duration={0.5}>
          <ScrambleText text="ARQUIVO DE PROJETOS" speed={2.5} />
          <span className="work-list__count">({String(projects.length).padStart(2, '0')})</span>
        </FadeIn>
        <WordReveal
          as="h1"
          className="windex__title"
          trigger="load"
          y={30}
          blur={10}
          stagger={0.06}
          duration={0.9}
          animateOpacity={false}
        >
          Portfólio de sites e sistemas desenvolvidos.
        </WordReveal>

        <div className="windex__rows">
          {projects.map((p, i) => (
            <FadeIn
              as="div"
              key={p.slug}
              trigger="load"
              delay={0.35 + i * 0.09}
              y={24}
              duration={0.7}
              animateOpacity={false}
            >
              <Link href={`/trabalhos/${p.slug}`} prefetch={false} className="windex__row">
                <span className="windex__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="windex__body">
                  <span className="windex__name">
                    <ScrambleText text={p.name} trigger="hover" speed={1.4} />
                  </span>
                  <span className="windex__meta">
                    {p.category}&nbsp;&nbsp;·&nbsp;&nbsp;{p.year}
                  </span>
                </span>
                <span className="windex__thumb" aria-hidden="true">
                  {renderThumbnails ? (
                    <ImageFill
                      src={p.workImage}
                      alt=""
                      sizes="200px"
                      quality={80}
                      objectFit="cover"
                      fallback={<div className="work-item__mockup-fill" />}
                    />
                  ) : null}
                </span>
                <span className="windex__arrow" aria-hidden="true">
                  <DrawArrow size={14} delay={0.5 + i * 0.09} />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
