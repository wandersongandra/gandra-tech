'use client'

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function getReducedMotionQuery() {
  return window.matchMedia(REDUCED_MOTION_QUERY)
}
