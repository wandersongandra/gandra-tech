'use client'
import { useRef, useEffect, ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getReducedMotionQuery } from './reducedMotion'

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
  animateOpacity?: boolean
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
  animateOpacity = true,
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const motionQuery = getReducedMotionQuery()
    let tween: gsap.core.Tween | null = null
    let st: ScrollTrigger | null = null
    let played = false

    const from = { opacity: animateOpacity ? 0 : 1, y, x, scale, rotation }
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

    const setFinal = () => {
      tween?.kill()
      st?.kill()
      gsap.killTweensOf(el)
      gsap.set(el, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        clearProps: 'transform,filter,opacity',
      })
    }

    const setInitial = () => {
      gsap.set(el, from)
    }

    const animate = () => {
      if (played && !repeat) return
      played = true
      tween?.kill()
      tween = gsap.fromTo(el, from, to)
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
  }, [animateOpacity, delay, duration, repeat, rotation, scale, start, trigger, x, y])

  const T = Tag

  return (
    <T
      ref={ref}
      className={className}
      data-motion-hidden="true"
      style={{ opacity: animateOpacity ? 0 : 1, ...style }}
    >
      {children}
    </T>
  )
}
