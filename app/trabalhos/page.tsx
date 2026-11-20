import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WorkIndex from '@/components/sections/WorkIndex'
import Breadcrumbs from '@/components/Breadcrumbs'
import StructuredData from '@/components/StructuredData'
import { createPageMetadata } from '@/lib/seo'
import { projects } from '@/lib/projects'

export const metadata = createPageMetadata({
  title: 'Portfólio de Sites e Sistemas Criados',
  description: 'Veja cases reais de sites institucionais, portfólios e sistemas criados pela Gandra Tecnologia. Conheça o contexto e as soluções de cada projeto.',
  path: '/trabalhos',
})

export default function Trabalhos() {
  return (
    <>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Portfólio de sites e sistemas desenvolvidos',
          url: 'https://gandra.tech/trabalhos',
          inLanguage: 'pt-BR',
          hasPart: projects.map((project) => ({
            '@type': 'CreativeWork',
            name: project.name,
            url: `https://gandra.tech/trabalhos/${project.slug}`,
            description: project.overview,
          })),
        }}
      />
      <Header />
      <main id="main-content">
        <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Trabalhos', href: '/trabalhos' }]} />
        <WorkIndex />
      </main>
      <Footer />
    </>
  )
}
