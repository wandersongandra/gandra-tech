'use client'
import { useRef, useEffect, ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getReducedMotionQuery } from './reducedMotion'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  children: string
  as?: ElementType
  className?: string
  trigger?: 'load' | 'scroll'
  delay?: number
  stagger?: number
  y?: number
  blur?: number
  rotation?: number
  duration?: number
  start?: string
  repeat?: boolean
  animateOpacity?: boolean
}

export default function WordReveal({
  children,
  as: Tag = 'span',
  className,
  trigger = 'scroll',
  delay = 0,
  stagger = 0.08,
  y = 36,
  blur = 10,
  rotation = 3,
  duration = 0.8,
  start = 'top 85%',
  repeat = false,
  animateOpacity = true,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const words = children.split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const spans = el.querySelectorAll<HTMLSpanElement>('[data-word]')
    const motionQuery = getReducedMotionQuery()
    const from = { opacity: animateOpacity ? 0 : 1, y, filter: `blur(${blur}px)`, rotation }
    let tween: gsap.core.Tween | null = null
    let st: ScrollTrigger | null = null
    let played = false

    const setFinal = () => {
      tween?.kill()
      st?.kill()
      gsap.killTweensOf(spans)
      gsap.set(spans, {
        opacity: 1,
        y: 0,
        filter: 'none',
        rotation: 0,
        clearProps: 'transform,filter,opacity',
      })
    }

    const setInitial = () => {
      gsap.set(spans, from)
    }

    const animate = () => {
      if (played && !repeat) return
      played = true
      tween?.kill()
      tween = gsap.fromTo(spans, from, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        rotation: 0,
        duration,
        ease: 'power3.out',
        stagger,
        delay,
        clearProps: 'filter',
      })
      return tween
    }

    const setup = () => {
      tween?.kill()
      st?.kill()

      if (motionQuery.matches) {
        setFinal()
        return
      }

      if (trigger === 'load') {
        animate()
        return
      }

      if (!played || repeat) setInitial()

      st = ScrollTrigger.create({
        trigger: el,
        start,
        onEnter: animate,
        onLeaveBack: repeat
          ? () => {
              played = false
              setInitial()
            }
          : undefined,
      })
    }

    const handleMotionChange = () => {
      if (motionQuery.matches) {
        setFinal()
      } else if (!played || repeat) {
        setup()
      }
    }

    setup()
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      tween?.kill()
      st?.kill()
    }
  }, [animateOpacity, blur, delay, duration, repeat, rotation, stagger, start, trigger, y])

  const T = Tag as any

  return (
    <T ref={ref} className={className}>
      {words.map((word, i) => (
        // O espaço fica FORA do span: dentro de um inline-block ele é
        // colapsado e as palavras grudam.
        <span key={i}>
            <span
              data-word=""
              data-motion-hidden="true"
              style={{ display: 'inline-block', opacity: animateOpacity ? 0 : 1 }}
            >
            {word}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </T>
  )
}
