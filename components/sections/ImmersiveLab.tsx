'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'

const OrbitalArtifact = dynamic(() => import('@/components/motion/OrbitalArtifact'), { ssr: false })

/**
 * Uma vitrine da engenharia visual da Gandra, não uma seção de promessas.
 * A escultura WebGL é progressiva: conteúdo, CTA e composição sobrevivem
 * quando o dispositivo prefere reduzir movimento ou não suporta GPU.
 */
export default function ImmersiveLab() {
  return (
    <section className="lab" id="laboratorio" aria-labelledby="lab-heading">
      <div className="container lab__topline">
        <span>02 / LABORATÓRIO CRIATIVO</span>
        <span>GANDRA TECH® — EXPERIÊNCIA DIGITAL</span>
      </div>

      <div className="lab__stage">
        <div className="lab__grid" aria-hidden="true" />
        <OrbitalArtifact />

        <div className="container lab__layout">
          <div className="lab__copy">
            <p className="lab__eyebrow"><span className="lab__signal" /> SISTEMAS COM IDENTIDADE</p>
            <h2 id="lab-heading" className="lab__title">
              A tecnologia é real.
              <span className="lab__title-italic"> A experiência também.</span>
            </h2>
            <p className="lab__description">
              Código bem construído não precisa ser invisível. A interface pode ter
              presença, movimento e personalidade — sem atrapalhar quem veio resolver algo.
            </p>
          </div>

          <div className="lab__annotations" aria-label="Três pilares da experiência">
            <span className="lab__annotations-header">NOSSO CAMPO DE TRABALHO</span>
            <div><span>01</span><strong>Engenharia de software</strong></div>
            <div><span>02</span><strong>Interfaces com intenção</strong></div>
            <div><span>03</span><strong>Produtos feitos para durar</strong></div>
          </div>
        </div>

        <div className="container lab__bottomline">
          <span className="lab__coordinate">G / T <i /> 01.26</span>
          <span className="lab__hint">MOVA O CURSOR · ROLE A PÁGINA</span>
          <Link href="/trabalhos" prefetch={false} className="lab__link">
            Ver o que construímos <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
