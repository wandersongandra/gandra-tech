import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactPage from '@/components/sections/ContactPage'
import { contactEmail } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contato',
  description: `Fale com a Gandra Tech: ${contactEmail}. Conta o que você tem em mente — respondemos com atenção.`,
  alternates: {
    canonical: '/contato',
  },
}

export default function Contato() {
  return (
    <>
      <Header />
      <main id="main-content">
        <ContactPage />
      </main>
      <Footer />
    </>
  )
}
