import type Lenis from 'lenis'

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

const HEADER_OFFSET = -65

export function scrollToSection(selector: string) {
  if (window.__lenis) {
    window.__lenis.scrollTo(selector, { offset: HEADER_OFFSET })
  } else {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
  }
}

export function scrollToTop() {
  if (window.__lenis) {
    window.__lenis.scrollTo(0)
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
