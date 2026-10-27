'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import KineticWordmark from '@/components/motion/KineticWordmark'
import LetterDrop from '@/components/motion/LetterDrop'
import { scrollToTop } from '@/lib/scroll'
import { contactEmail, contactMailto, siteLastModified } from '@/lib/site'

const navigation = [
  { href: '/servicos', label: 'Serviços' },
  { href: '/trabalhos', label: 'Trabalhos' },
  { href: '/contato', label: 'Contato' },
]

// Ano fixo no HTML estático (constante, igual no build e no navegador); o do
// relógio do visitante entra só depois da hidratação. Ler new Date() direto
// no render fazia o HTML (gerado no build) e o cliente discordarem a partir
// de 1º de janeiro: erro de hidratação #418 em todas as páginas e a árvore
// inteira re-renderizada no cliente.
const BUILD_YEAR = Number(siteLastModified.slice(0, 4))

function useCurrentYear() {
  const [year, setYear] = useState(BUILD_YEAR)
  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])
  return year
}

export default function Footer() {
  const year = useCurrentYear()
  return (
    <footer className="site-footer m-footer">
      <div className="m-shell">
        <div className="m-footer__grid">
          <div className="m-footer__col">
            <span className="m-label">Estúdio</span>
            <p className="m-footer__about">
              Gandra Tecnologia — sites, sistemas sob medida, aplicações web e automações. Atendimento
              remoto em todo o Brasil.
            </p>
          </div>
          <nav className="m-footer__col" aria-label="Rodapé">
            <span className="m-label">Navegação</span>
            <ul className="m-footer__list">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} prefetch={false} className="m-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="m-footer__col">
            <span className="m-label">Contato</span>
            <a href={contactMailto} className="m-link">
              {contactEmail}
            </a>
          </div>
        </div>

        <div className="m-footer__mark">
          <KineticWordmark text="Gandra.tech" />
        </div>

        <div className="m-footer__bar mono">
          <div className="site-footer__copy">© {year} Gandra Tech</div>
          <nav className="site-footer__legal" aria-label="Informações legais">
            <Link href="/termos-de-uso" prefetch={false}>
              Termos de Uso
            </Link>
            <Link href="/politica-de-privacidade" prefetch={false}>
              Privacidade
            </Link>
          </nav>
          <LetterDrop targetSelector=".m-footer__mark" />
          <button type="button" onClick={scrollToTop} aria-label="Voltar ao topo" className="site-footer__top">
            ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
