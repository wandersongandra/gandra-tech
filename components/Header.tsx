'use client'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { scrollToSection } from '@/lib/scroll'

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const logoRef = useRef<HTMLAnchorElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    window.setTimeout(() => menuButtonRef.current?.focus(), 0)
  }, [])

  const handleWorksClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (isHome) {
      event.preventDefault()
      scrollToSection('#trabalhos')
    }
    closeMenu()
  }, [closeMenu, isHome])

  // Logo vivo: as letras "respiram" — o espaçamento abre conforme o
  // scroll desce e se comprime de volta no topo.
  useEffect(() => {
    const logo = logoRef.current
    if (!logo) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => firstMenuLinkRef.current?.focus(), 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closeMenu()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [closeMenu, isMenuOpen])

  const handleMenuToggle = () => {
    if (isMenuOpen) {
      closeMenu()
      return
    }
    setIsMenuOpen(true)
  }

  const handleMenuLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    handleWorksClick(event)
  }

  return (
    <header className="site-header">
      <Link href="/" prefetch={false} ref={logoRef} className="site-header__logo">
        GANDRA TECH<sup>®</sup>
      </Link>
      <nav className="site-header__nav" aria-label="Navegação principal">
        <Link href="/servicos" prefetch={false} className="site-header__link">
          Serviços
        </Link>
        {isHome ? (
          <button onClick={() => scrollToSection('#trabalhos')} className="site-header__link">
            Trabalhos
          </button>
        ) : (
          <Link href="/#trabalhos" prefetch={false} className="site-header__link">
            Trabalhos
          </Link>
        )}
        <Link href="/contato" prefetch={false} className="site-header__link">
          Contato
        </Link>
      </nav>
      <button
        ref={menuButtonRef}
        type="button"
        className="site-header__menu-toggle"
        aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        onClick={handleMenuToggle}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {isMenuOpen && (
        <div
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeMenu()
          }}
        >
          <nav id="mobile-menu" className="mobile-menu__panel" aria-label="Navegação mobile">
            <Link
              ref={firstMenuLinkRef}
              href="/"
              prefetch={false}
              className="mobile-menu__link"
              onClick={closeMenu}
            >
              Início
            </Link>
            <Link href="/servicos" prefetch={false} className="mobile-menu__link" onClick={closeMenu}>
              Serviços
            </Link>
            <Link
              href={isHome ? '#trabalhos' : '/#trabalhos'}
              prefetch={false}
              className="mobile-menu__link"
              onClick={handleMenuLinkClick}
            >
              Trabalhos
            </Link>
            <Link href="/contato" prefetch={false} className="mobile-menu__link" onClick={closeMenu}>
              Contato
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
