import Link from 'next/link'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NotFoundLetters from '@/components/motion/NotFoundLetters'

export const metadata: Metadata = {
  title: 'Página não encontrada',
  description: 'O endereço informado não corresponde a uma página publicada pela Gandra Tech.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="cp-hero">
          <div className="container">
            <div className="cp-hero__label">ERRO / PÁGINA NÃO ENCONTRADA</div>
            <NotFoundLetters />
            <h1 className="cp-hero__title">Esta página saiu do ar — ou nunca existiu.</h1>
            <p className="cp-hero__sub">
              O endereço não corresponde a nenhuma página do site. Volte para a página inicial
              ou conheça os projetos.
            </p>
            <Link href="/" prefetch={false} className="link-arrow cp-hero__email">
              Voltar ao início ↗
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
