'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { getReducedMotionQuery } from './reducedMotion'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const motionQuery = getReducedMotionQuery()
    let tween: gsap.core.Tween | null = null

    const setFinal = () => {
      tween?.kill()
      gsap.killTweensOf(el)
      gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform,opacity' })
    }

    const setup = () => {
      tween?.kill()
      if (motionQuery.matches) {
        setFinal()
        return
      }

      tween = gsap.fromTo(
        el,
        { y: 28 },
        { y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }
      )
    }

    const handleMotionChange = () => {
      if (motionQuery.matches) setFinal()
    }

    setup()
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      tween?.kill()
    }
  }, [])

  return (
    <div ref={ref} data-motion-hidden="true" style={{ opacity: 1 }}>
      {children}
    </div>
  )
}
