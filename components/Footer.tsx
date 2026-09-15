'use client'
import Link from 'next/link'
import { scrollToTop } from '@/lib/scroll'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__copy">© {new Date().getFullYear()} Gandra Tech</div>
      <div className="site-footer__icons">
        <nav className="site-footer__legal" aria-label="Informações legais">
          <Link href="/termos-de-uso" prefetch={false}>Termos de Uso</Link>
          <Link href="/politica-de-privacidade" prefetch={false}>Privacidade</Link>
        </nav>
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          className="site-footer__top"
        >
          ↑
        </button>
      </div>
    </footer>
  )
}
