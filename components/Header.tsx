'use client'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { scrollToSection } from '@/lib/scroll'
import { contactMailto } from '@/lib/site'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuPanelRef = useRef<HTMLElement>(null)
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

  // Cabeçalho "Matéria": esconde ao descer, volta ao subir, ganha fundo
  // depois do topo e mostra uma linha fina de progresso de leitura.
  // Só transform/opacity — nada de layout.
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    let raf = 0
    let lastY = window.scrollY
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      raf = 0
      const y = window.scrollY
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      header.style.setProperty('--progress', (y / max).toFixed(4))
      header.classList.toggle('is-scrolled', y > 24)
      const goingDown = y > lastY + 4
      const goingUp = y < lastY - 4
      // No celular o cabeçalho fica sempre à mão (o menu é a navegação).
      const canHide = window.innerWidth >= 768 && !reduceMotion.matches
      if (goingDown && y > 320 && canHide) header.classList.add('is-hidden')
      else if (goingUp || y < 320) header.classList.remove('is-hidden')
      if (goingDown || goingUp) lastY = y
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    // Foco por teclado nunca fica escondido.
    const onFocus = () => header.classList.remove('is-hidden')
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    header.addEventListener('focusin', onFocus)
    return () => {
      window.removeEventListener('scroll', onScroll)
      header.removeEventListener('focusin', onFocus)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => firstMenuLinkRef.current?.focus(), 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return
      }

      if (event.key !== 'Tab') return

      const panel = mobileMenuPanelRef.current
      if (!panel) return

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.getClientRects().length > 0,
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault()
        first.focus()
      }
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
    <header ref={headerRef} className="site-header m-header">
      <span className="m-header__progress" aria-hidden="true" />
      <Link href="/" prefetch={false} className="site-header__logo">
        <span className="site-header__logo-mark" aria-hidden="true">G</span>
        <span className="site-header__logo-text">Gandra Tech</span>
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
      <a href={contactMailto} className="m-header__cta">
        <span className="m-header__cta-dot" aria-hidden="true" />
        Iniciar projeto
      </a>
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
          <nav
            ref={mobileMenuPanelRef}
            id="mobile-menu"
            className="mobile-menu__panel"
            aria-label="Navegação mobile"
          >
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
