'use client'
import { useRef, useEffect, ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  children: React.ReactNode
  as?: ElementType
  className?: string
  style?: React.CSSProperties
  trigger?: 'load' | 'scroll'
  delay?: number
  y?: number
  x?: number
  scale?: number
  rotation?: number
  duration?: number
  start?: string
  repeat?: boolean
}

export default function FadeIn({
  children,
  as: Tag = 'div',
  className,
  style,
  trigger = 'scroll',
  delay = 0,
  y = 24,
  x = 0,
  scale = 1,
  rotation = 0,
  duration = 0.7,
  start = 'top 85%',
  repeat = false,
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, clearProps: 'transform' })
      return
    }

    const from = { opacity: 0, y, x, scale, rotation }
    const to = {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotation: 0,
      duration,
      ease: 'power2.out',
      delay,
    }

    const animate = () => gsap.fromTo(el, from, to)

    if (trigger === 'load') {
      animate()
      return
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start,
      onEnter: animate,
      onLeaveBack: repeat ? () => gsap.set(el, from) : undefined,
    })

    return () => st.kill()
  }, [delay, duration, repeat, rotation, scale, start, trigger, x, y])

  const T = Tag as any

  return (
    <T ref={ref} className={className} data-motion="fade" style={{ opacity: 0, ...style }}>
      {children}
    </T>
  )
}
