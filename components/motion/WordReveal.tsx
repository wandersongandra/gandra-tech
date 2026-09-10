'use client'
import { useRef, useEffect, ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const words = children.split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const spans = el.querySelectorAll<HTMLSpanElement>('[data-word]')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(spans, { opacity: 1, y: 0, rotation: 0, filter: 'none', clearProps: 'transform' })
      return
    }

    const from = { opacity: 0, y, filter: `blur(${blur}px)`, rotation }

    const animate = () =>
      gsap.fromTo(spans, from, {
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

    if (trigger === 'load') {
      animate()
      return
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start,
      onEnter: animate,
      onLeaveBack: repeat ? () => gsap.set(spans, from) : undefined,
    })

    return () => st.kill()
  }, [blur, delay, duration, repeat, rotation, stagger, start, trigger, y])

  const T = Tag as any

  return (
    <T ref={ref} className={className} data-motion="word-reveal">
      {words.map((word, i) => (
        <span key={i}>
          <span data-word="" style={{ display: 'inline-block', opacity: 0 }}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </T>
  )
}
