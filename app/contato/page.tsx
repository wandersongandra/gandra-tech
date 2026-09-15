import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactPage from '@/components/sections/ContactPage'
import Breadcrumbs from '@/components/Breadcrumbs'
import StructuredData from '@/components/StructuredData'

import { contactEmail, siteUrl } from '@/lib/site'
import { faqItems } from '@/lib/faq'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Contato',
  description: `Solicite um orçamento para site ou sistema à Gandra Tecnologia: ${contactEmail}. Atendimento remoto em todo o Brasil.`,
  path: '/contato',
})

export default function Contato() {
  return (
    <>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': `${siteUrl}/contato#faq`,
          url: `${siteUrl}/contato`,
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
      <Header />
      <main id="main-content">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Contato', href: '/contato' }]} />
        <ContactPage />
      </main>
      <Footer />
    </>
  )
}
