'use client'
import { useRef, useEffect } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#/'

interface Props {
  text: string
  className?: string
  delay?: number
  trigger?: 'load' | 'scroll' | 'hover'
  speed?: number
}

export default function ScrambleText({
  text,
  className,
  delay = 0,
  trigger = 'scroll',
  speed = 3,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text
      return
    }

    // Hover não é uma interação confiável em smartphones. Mantém o nome
    // legível em vez de deixar um estado de scramble preso após o toque.
    if (trigger === 'hover' && window.matchMedia('(max-width: 767px)').matches) {
      el.textContent = text
      return
    }

    let raf = 0

    const run = () => {
      const chars = text.split('')
      const locked: boolean[] = chars.map(() => false)
      let frame = 0

      const step = () => {
        frame++
        el.textContent = chars
          .map((char, i) => {
            if (char === ' ') return ' '
            if (locked[i]) return char
            const lockAt = Math.floor((i + 1) * speed)
            if (frame >= lockAt) {
              locked[i] = true
              return char
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')

        if (locked.every(Boolean)) return
        raf = requestAnimationFrame(step)
      }

      const tid = setTimeout(() => {
        raf = requestAnimationFrame(step)
      }, delay * 1000)

      return () => {
        clearTimeout(tid)
        cancelAnimationFrame(raf)
      }
    }

    if (trigger === 'load') return run()

    if (trigger === 'hover') {
      let cleanup: (() => void) | undefined
      const onEnter = () => {
        cleanup?.()
        cleanup = run()
      }
      el.addEventListener('mouseenter', onEnter)
      return () => {
        el.removeEventListener('mouseenter', onEnter)
        cleanup?.()
      }
    }

    let cleanup: (() => void) | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cleanup = run()
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cleanup?.()
    }
  }, [text, delay, trigger, speed])

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
