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

    const dir = flipped ? -1 : 1
    const infoParts = info.querySelectorAll<HTMLElement>('[data-stagger]')
    const mm = gsap.matchMedia()

    mm.add(
      {
        isRail: '(min-width: 1024px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isRail, reduceMotion } = context.conditions as {
          isRail: boolean
          reduceMotion: boolean
        }

        // Quem opta por menos movimento recebe o mesmo conteúdo e a mesma
        // direção visual, mas sem depender de transformações para enxergá-lo.
        if (reduceMotion) {
          gsap.set(curtain, { scaleX: 0 })
          gsap.set(tilt, { rotationY: 0, rotationX: 0, scale: 1, opacity: 1 })
          gsap.set(infoParts, { opacity: 1, y: 0, filter: 'none' })
          gsap.set([parallaxEl, spin], { clearProps: 'transform' })
          if (ghost) gsap.set(ghost, { clearProps: 'transform' })
          if (number) gsap.set(number, { clearProps: 'transform' })
          return
        }

        const setInitial = () => {
          gsap.set(curtain, {
            scaleX: 1,
            transformOrigin: flipped ? 'right center' : 'left center',
          })
          gsap.set(tilt, { rotationY: 18 * dir, rotationX: 6, scale: 1.06, opacity: 0 })
          gsap.set(infoParts, { opacity: 0, y: 26, filter: 'blur(6px)' })
        }
        setInitial()

        const build = () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

          tl.to(tilt, { opacity: 1, duration: 0.3 }, 0)
            .to(curtain, { scaleX: 0, duration: 0.95, ease: 'expo.inOut' }, 0)
            .to(
              tilt,
              { rotationY: 0, rotationX: 0, scale: 1, duration: 1.25, ease: 'power4.out' },
              0.12
            )
            .to(
              infoParts,
              {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                stagger: 0.09,
                clearProps: 'filter',
              },
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

        // Também cobre saltos por âncora e navegação programática.
        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) if (entry.isIntersecting) play()
          },
          { rootMargin: '0px 0px -22% 0px' }
        )
        io.observe(row)

        let cleanupVertical: (() => void) | undefined
        if (!isRail) {
          const parallax = gsap.fromTo(
            parallaxEl,
            { yPercent: 4 },
            {
              yPercent: -4,
              ease: 'none',
              scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          )

          const spinTween = gsap.fromTo(
            spin,
            { rotationY: 22 * dir, rotationX: 3 },
            {
              rotationY: -22 * dir,
              rotationX: -3,
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            }
          )

          const ghostTween = ghost
            ? gsap.fromTo(
                ghost,
                { xPercent: flipped ? 8 : -8 },
                {
                  xPercent: flipped ? -8 : 8,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: row,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                  },
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
                  scrollTrigger: {
                    trigger: row,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                  },
                }
              )
            : null

          const skewTo = gsap.quickTo(spin, 'skewY', { duration: 0.5, ease: 'power3.out' })
          const scaleTo = gsap.quickTo(spin, 'scaleY', { duration: 0.5, ease: 'power3.out' })
          const leanTo = gsap.quickTo(spin, 'rotation', { duration: 0.7, ease: 'power2.out' })

          let raf = 0
          let active = false

          const applyVelocity = () => {
            if (!active) return
            const vel = (parallax.scrollTrigger?.getVelocity() ?? 0) / 900
            const v = gsap.utils.clamp(-1, 1, vel)
            skewTo(v * -4)
            scaleTo(1 + Math.abs(v) * 0.03)
            leanTo(v * -0.8 * dir)
            raf = requestAnimationFrame(applyVelocity)
          }

          // O efeito continua completo, mas o loop pesado só existe enquanto
          // esta linha está próxima da viewport.
          const velocityObserver = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting && !active) {
                active = true
                raf = requestAnimationFrame(applyVelocity)
              } else if (!entry.isIntersecting && active) {
                active = false
                cancelAnimationFrame(raf)
                skewTo(0)
                scaleTo(1)
                leanTo(0)
              }
            },
            { rootMargin: '35% 0px 35% 0px' }
          )
          velocityObserver.observe(row)

          cleanupVertical = () => {
            active = false
            cancelAnimationFrame(raf)
            velocityObserver.disconnect()
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
      }
    )

    return () => mm.revert()
  }, [flipped, index])

  return (
    <div ref={rowRef}>
      <Link
        href={`/trabalhos/${work.slug}`}
        className={`work-item${flipped ? ' work-item--flipped' : ''}`}
      >
        <div ref={ghostRef} className="work-item__ghost" aria-hidden="true">
          {work.name}
        </div>

        <div ref={numberRef} className="work-item__number" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </div>

        <div ref={parallaxRef} className="work-item__mockup">
          <div className="work-item__stage">
            <div ref={spinRef} className="work-item__spin">
              <div ref={tiltRef} className="work-item__tilt">
                <ImageFill
                  src={`/images/work/${work.slug}.png`}
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

  // O trilho continua cinematográfico em desktop. gsap.matchMedia reconstrói
  // o comportamento ao cruzar breakpoints e fornece fallback estático quando
  // o usuário solicita menos movimento.
  useEffect(() => {
    const rail = railRef.current
    const track = trackRef.current
    if (!rail || !track) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions as {
          isDesktop: boolean
          reduceMotion: boolean
        }

        rail.style.height = ''
        gsap.set(track, { clearProps: 'transform' })

        if (!isDesktop || reduceMotion) {
          ScrollTrigger.refresh()
          return
        }

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
          rail.style.height = ''
          gsap.set(track, { clearProps: 'transform' })
        }
      }
    )

    return () => mm.revert()
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
