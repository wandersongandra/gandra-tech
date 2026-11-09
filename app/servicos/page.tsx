import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumbs from '@/components/Breadcrumbs'
import StructuredData from '@/components/StructuredData'
import ServicesPage from '@/components/sections/ServicesPage'
import { services } from '@/lib/services'
import { createPageMetadata, createServiceJsonLd } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Criação de Sites e Sistemas Web em BH',
  description:
    'Criação de sites, sistemas web e automações com atuação em Belo Horizonte e atendimento nacional. Conheça os serviços da Gandra e solicite uma proposta.',
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
