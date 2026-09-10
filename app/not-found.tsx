import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NotFoundLetters from '@/components/motion/NotFoundLetters'

export const metadata = {
  title: 'Página não encontrada',
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
            <Link href="/" className="link-arrow cp-hero__email">
              Voltar ao início ↗
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
