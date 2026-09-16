import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WorkIndex from '@/components/sections/WorkIndex'
import Breadcrumbs from '@/components/Breadcrumbs'
import StructuredData from '@/components/StructuredData'
import { projects } from '@/lib/projects'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Trabalhos',
  description: `Portfólio de sites, sistemas e produtos digitais da Gandra Tecnologia: ${projects
    .map((p) => p.name)
    .join(', ')}.`,
  path: '/trabalhos',
  image: '/og/trabalhos.png',
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
