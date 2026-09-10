'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform' })
      return
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }
    )
  }, [])

  return (
    <div ref={ref} data-motion="page-transition" style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
