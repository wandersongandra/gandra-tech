'use client'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WordReveal from '@/components/motion/WordReveal'
import ScrambleText from '@/components/motion/ScrambleText'
import ImageFill from '@/components/motion/ImageFill'
import DrawArrow from '@/components/motion/DrawArrow'
import { projects } from '@/lib/projects'

gsap.registerPlugin(ScrollTrigger)

const works = projects.map((p) => ({
  slug: p.slug,
  name: p.name,
  category: p.category,
  year: p.year,
  headline: p.headline,
  workImage: p.workImage,
}))

function WorkRow({
  work,
  flipped,
  index,
}: {
  work: (typeof works)[0]
  flipped: boolean
  index: number
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const spinRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLDivElement>(null)
  const numberRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row = rowRef.current
    const parallaxEl = parallaxRef.current
    const spin = spinRef.current
    const tilt = tiltRef.current
    const curtain = curtainRef.current
    const info = infoRef.current
    const ghost = ghostRef.current
    const number = numberRef.current
    if (!row || !parallaxEl || !spin || !tilt || !curtain || !info) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // No trilho horizontal (desktop largo) os efeitos atados ao scroll
    // vertical não fazem sentido: fica só a revelação por IntersectionObserver.
    const isRail = window.matchMedia('(min-width: 1024px)').matches

    // A direção de onde a cortina abre e de onde o mockup gira acompanha
    // o lado em que ele está, para o movimento apontar sempre "para fora".
    const dir = flipped ? -1 : 1
    const infoParts = info.querySelectorAll<HTMLElement>('[data-stagger]')

    const setInitial = () => {
      gsap.set(curtain, { scaleX: 1, transformOrigin: flipped ? 'right center' : 'left center' })
      gsap.set(tilt, { rotationY: 18 * dir, rotationX: 6, scale: 1.06, opacity: 0 })
      gsap.set(infoParts, { opacity: 0, y: 26, filter: 'blur(6px)' })
    }

    if (reduced) {
      gsap.set(tilt, { opacity: 1, rotationY: 0, rotationX: 0, scale: 1, clearProps: 'transform' })
      gsap.set(curtain, { scaleX: 0, clearProps: 'transform' })
      gsap.set(infoParts, { opacity: 1, y: 0, filter: 'none', clearProps: 'transform,filter' })
      return
    }
    setInitial()

    const build = () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // 1. O mockup já está girado atrás da cortina e aparece durante a abertura.
      tl.to(tilt, { opacity: 1, duration: 0.3 }, 0)
        // 2. A cortina desliza revelando.
        .to(curtain, { scaleX: 0, duration: 0.95, ease: 'expo.inOut' }, 0)
        // 3. O mockup endireita e assenta.
        .to(
          tilt,
          { rotationY: 0, rotationX: 0, scale: 1, duration: 1.25, ease: 'power4.out' },
          0.12
        )
        // 4. O texto entra em cascata pelo lado.
        .to(
          infoParts,
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.09, clearProps: 'filter' },
          0.35
        )

      return tl
    }

    let tl: gsap.core.Timeline | null = null
    let played = false

    const play = () => {
      if (played) return
      played = true
      tl = build()
    }

    let st: ScrollTrigger | null = null
    if (!isRail) {
      st = ScrollTrigger.create({
        trigger: row,
        start: 'top 78%',
        onEnter: play,
        onLeaveBack: () => {
          tl?.kill()
          played = false
          setInitial()
        },
      })
    }

    // Rede de segurança: saltos de scroll (âncora, refresh no meio da página,
    // scrollTo programático) podem não propagar do Lenis para o ScrollTrigger,
    // e a linha ficaria coberta pela cortina. O observer garante a revelação.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) play()
      },
      { rootMargin: '0px 0px -22% 0px' }
    )
    io.observe(row)

    // Daqui em diante só efeitos de scroll vertical — pulados no trilho.
    let cleanupVertical: (() => void) | undefined
    if (!isRail) {
      // Parallax sutil enquanto a linha atravessa a viewport — em camada
      // própria para não conflitar com o tilt nem com o hover.
      const parallax = gsap.fromTo(
        parallaxEl,
        { yPercent: 4 },
        {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      )

      // Rotação 3D contínua: chega inclinada, fica reta no centro da viewport,
      // inclina para o outro lado ao sair. Camada própria (spin), separada do
      // tilt da entrada — dois tweens no mesmo elemento se sobrescreveriam.
      const spinTween = gsap.fromTo(
        spin,
        { rotationY: 22 * dir, rotationX: 3 },
        {
          rotationY: -22 * dir,
          rotationX: -3,
          ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        }
      )

      // Título fantasma e número deslizam em contrafluxo ao scroll.
      const ghostTween = ghost
        ? gsap.fromTo(
            ghost,
            { xPercent: flipped ? 8 : -8 },
            {
              xPercent: flipped ? -8 : 8,
              ease: 'none',
              scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          )
        : null

      const numberTween = number
        ? gsap.fromTo(
            number,
            { yPercent: 40 },
            {
              yPercent: -40,
              ease: 'none',
              scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          )
        : null

      // Distorção pela velocidade do scroll: quanto mais rápido, mais o mockup
      // "entorta" e inclina; ao parar, tudo relaxa. quickTo evita criar um tween
      // por frame. A velocidade vem do ScrollTrigger, que já reflete o scroll
      // suavizado do Lenis.
      const skewTo = gsap.quickTo(spin, 'skewY', { duration: 0.5, ease: 'power3.out' })
      const scaleTo = gsap.quickTo(spin, 'scaleY', { duration: 0.5, ease: 'power3.out' })
      // 'rotation' (GSAP), não 'rotate' (CSS): a propriedade CSS independente
      // conflita com o transform que o GSAP já escreve neste elemento.
      const leanTo = gsap.quickTo(spin, 'rotation', { duration: 0.7, ease: 'power2.out' })
      let raf = 0
      const applyVelocity = () => {
        const vel = (parallax.scrollTrigger?.getVelocity() ?? 0) / 900
        const v = gsap.utils.clamp(-1, 1, vel)
        skewTo(v * -4)
        scaleTo(1 + Math.abs(v) * 0.03)
        // Inclina para o lado contrário ao movimento, como inércia.
        leanTo(v * -0.8 * dir)
        raf = requestAnimationFrame(applyVelocity)
      }
      raf = requestAnimationFrame(applyVelocity)

      cleanupVertical = () => {
        cancelAnimationFrame(raf)
        parallax.scrollTrigger?.kill()
        spinTween.scrollTrigger?.kill()
        ghostTween?.scrollTrigger?.kill()
        numberTween?.scrollTrigger?.kill()
      }
    }

    return () => {
      io.disconnect()
      tl?.kill()
      st?.kill()
      cleanupVertical?.()
    }
  }, [flipped, index])

  return (
    <div ref={rowRef}>
      <Link
        href={`/trabalhos/${work.slug}`}
        className={`work-item${flipped ? ' work-item--flipped' : ''}`}
      >
        {/* Título fantasma: nome do projeto em escala editorial, ao fundo. */}
        <div ref={ghostRef} className="work-item__ghost" aria-hidden="true">
          {work.name}
        </div>

        {/* Numeração do projeto, com movimento próprio. */}
        <div ref={numberRef} className="work-item__number" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Camadas empilhadas — cada transform tem dono exclusivo:
            parallax (y) › spin (rotação do scroll + skew) › tilt (entrada). */}
        <div ref={parallaxRef} className="work-item__mockup">
          <div className="work-item__stage">
            <div ref={spinRef} className="work-item__spin">
              <div ref={tiltRef} className="work-item__tilt">
                <ImageFill
                  src={work.workImage}
                  alt={`Mockup do projeto ${work.name}`}
                  sizes="(min-width: 1200px) 560px, (min-width: 768px) 45vw, 85vw"
                  quality={95}
                  objectFit="contain"
                  objectPosition="center"
                  fallback={<div className="work-item__mockup-fill" />}
                />
              </div>
              <div ref={curtainRef} className="work-item__curtain" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div ref={infoRef} className="work-item__info">
          <div className="work-item__meta" data-stagger>
            {work.category}&nbsp;&nbsp;&nbsp;{work.year}
          </div>
          <h3 className="work-item__name" data-stagger>
            <ScrambleText text={work.name} trigger="hover" speed={1.4} />
          </h3>
          <p className="work-item__headline" data-stagger>
            {work.headline}
          </p>
          <span className="link-arrow work-item__action" data-stagger>
            Abrir projeto{' '}
            <span>
              <DrawArrow size={13} delay={0.6} />
            </span>
          </span>
        </div>
      </Link>
    </div>
  )
}

export default function WorkList() {
  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Trilho horizontal: no desktop a seção ganha altura extra e o scroll
  // vertical desliza os projetos para o lado. Mobile continua vertical.
  useEffect(() => {
    const rail = railRef.current
    const track = trackRef.current
    if (!rail || !track) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Altura do trilho = distância horizontal a percorrer + uma viewport.
    const setHeight = () => {
      rail.style.height = `${track.scrollWidth - window.innerWidth + window.innerHeight}px`
      ScrollTrigger.refresh()
    }
    setHeight()
    window.addEventListener('resize', setHeight)
    document.fonts?.ready.then(setHeight)

    const tween = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: rail,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })

    return () => {
      window.removeEventListener('resize', setHeight)
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section id="trabalhos" className="work-list">
      <div className="container">
        <div className="section-label">
          <ScrambleText text="TRABALHOS SELECIONADOS" speed={2.5} />
          <span className="work-list__aside">
            <span className="work-list__count">({String(works.length).padStart(2, '0')})</span>
            <Link href="/trabalhos" className="work-list__archive">
              ver arquivo completo ↗
            </Link>
          </span>
        </div>
        <WordReveal as="h2" className="work-list__title" y={26} blur={10} stagger={0.06} duration={0.8}>
          Feito para o movimento.
        </WordReveal>
      </div>
      <div ref={railRef} className="work-rail">
        <div className="work-rail__sticky">
          <div ref={trackRef} className="work-rail__track work-list__items">
            {works.map((w, i) => (
              <WorkRow key={w.slug} work={w} flipped={i % 2 === 1} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
