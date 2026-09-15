import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumbs from '@/components/Breadcrumbs'
import StructuredData from '@/components/StructuredData'
import ServicesPage from '@/components/sections/ServicesPage'
import { services } from '@/lib/services'
import { createPageMetadata, createServiceJsonLd } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Serviços de desenvolvimento web',
  description:
    'Conheça os serviços da Gandra Tecnologia: sites institucionais, portfólios profissionais, sistemas sob medida e aplicações web para todo o Brasil.',
  path: '/servicos',
})

export default function Servicos() {
  return (
    <>
      <StructuredData
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Serviços de desenvolvimento web',
            url: 'https://gandra.tech/servicos',
            description:
              'Sites institucionais, portfólios profissionais, sistemas sob medida e aplicações web para empresas e profissionais em todo o Brasil.',
            inLanguage: 'pt-BR',
            hasPart: services.map(createServiceJsonLd),
          },
          ...services.map(createServiceJsonLd),
        ]}
      />
      <Header />
      <main id="main-content">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Serviços', href: '/servicos' }]} />
        <ServicesPage />
      </main>
      <Footer />
    </>
  )
}
