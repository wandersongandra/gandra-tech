import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumbs from '@/components/Breadcrumbs'
import StructuredData from '@/components/StructuredData'
import ServicesPage from '@/components/sections/ServicesPage'
import { services } from '@/lib/services'
import { createPageMetadata, createServiceJsonLd } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Sites, Sistemas e Automações para Empresas',
  description:
    'Conheça nossos serviços de criação de sites, sistemas empresariais, aplicações web e automações. Projetos sob medida, atendimento no Brasil. Converse conosco.',
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
            name: 'Desenvolvimento de sites, sistemas e automações',
            url: 'https://gandra.tech/servicos',
            description:
              'Sites institucionais, portfólios profissionais, sistemas sob medida, automações e aplicações web para empresas e profissionais em todo o Brasil.',
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
