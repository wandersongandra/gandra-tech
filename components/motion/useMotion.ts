'use client'
import { useEffect, useState } from 'react'

/**
 * Preferências de movimento do visitante, reativas a mudanças do sistema.
 * - `reduced`: prefers-reduced-motion — todo movimento vira estado final.
 * - `fine`: ponteiro preciso (mouse/trackpad) — interações de cursor.
 * - `wide`: viewport ≥ 1024px — pin/scroll horizontal.
 */
export type MotionPrefs = { ready: boolean; reduced: boolean; fine: boolean; wide: boolean }

const QUERIES = {
  reduced: '(prefers-reduced-motion: reduce)',
  fine: '(hover: hover) and (pointer: fine)',
  wide: '(min-width: 1024px)',
} as const

export function useMotionPrefs(): MotionPrefs {
  const [prefs, setPrefs] = useState<MotionPrefs>({ ready: false, reduced: true, fine: false, wide: false })

  useEffect(() => {
    const lists = Object.fromEntries(
      Object.entries(QUERIES).map(([key, query]) => [key, window.matchMedia(query)])
    ) as Record<keyof typeof QUERIES, MediaQueryList>
    const sync = () =>
      setPrefs({ ready: true, reduced: lists.reduced.matches, fine: lists.fine.matches, wide: lists.wide.matches })
    sync()
    for (const list of Object.values(lists)) list.addEventListener('change', sync)
    return () => {
      for (const list of Object.values(lists)) list.removeEventListener('change', sync)
    }
  }, [])

  return prefs
}
