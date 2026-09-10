'use client'
import { useRef, useEffect, ReactNode } from 'react'
import gsap from 'gsap'

interface Props {
  children: ReactNode
  strength?: number
  className?: string
}

export default function MagneticButton({ children, strength = 0.38, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return
    if (window.matchMedia('(max-width: 767px), (pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) * strength
      const y = (e.clientY - rect.top - rect.height / 2) * strength
      gsap.to(inner, { x, y, duration: 0.4, ease: 'power2.out' })
    }

    const onLeave = () => {
      gsap.to(inner, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.45)' })
    }

    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)

    return () => {
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return (
    <div ref={wrapRef} className={`magnetic-wrap${className ? ` ${className}` : ''}`}>
      <div ref={innerRef}>{children}</div>
    </div>
  )
}
