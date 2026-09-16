'use client'

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function getReducedMotionQuery() {
  return window.matchMedia(REDUCED_MOTION_QUERY)
}

export function addReducedMotionListener(callback: (reduced: boolean) => void) {
  const query = getReducedMotionQuery()
  const handleChange = (event: MediaQueryListEvent) => callback(event.matches)

  query.addEventListener('change', handleChange)

  return () => query.removeEventListener('change', handleChange)
}
