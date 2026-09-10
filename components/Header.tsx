'use client'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { scrollToSection } from '@/lib/scroll'

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const logoRef = useRef<HTMLAnchorElement>(null)

  // Logo vivo no desktop. Em touch/mobile o espaçamento permanece estável
  // para preservar largura útil e evitar reflow durante a rolagem.
  useEffect(() => {
    const logo = logoRef.current
    if (!logo) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(max-width: 767px), (pointer: coarse)').matches) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const p = Math.min(window.scrollY / 500, 1)
        logo.style.letterSpacing = `${0.1 + p * 0.14}em`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header className="site-header">
      <Link href="/" ref={logoRef} className="site-header__logo">
        GANDRA TECH<sup>®</sup>
      </Link>
      <nav className="site-header__nav" aria-label="Navegação principal">
        {isHome ? (
          <button onClick={() => scrollToSection('#trabalhos')} className="site-header__link">
            Trabalhos
          </button>
        ) : (
          <Link href="/#trabalhos" className="site-header__link">
            Trabalhos
          </Link>
        )}
        <Link href="/contato" className="site-header__link">
          Vamos conversar
        </Link>
      </nav>
    </header>
  )
}
