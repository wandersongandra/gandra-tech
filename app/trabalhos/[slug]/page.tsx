import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProjectView from '@/components/sections/ProjectView'
import Breadcrumbs from '@/components/Breadcrumbs'
import StructuredData from '@/components/StructuredData'
import { getProject, getNextProject, projects } from '@/lib/projects'
import { createPageMetadata } from '@/lib/seo'

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return createPageMetadata({
    title:
      project.slug === 'sgs'
        ? 'SGS Segurança — Sistema Sob Medida'
        : 'Telma Santos — Portfólio Profissional',
    description:
      project.slug === 'sgs'
        ? 'Case de sistema sob medida para gestão de segurança do trabalho, com inspeções, APRs, permissões, auditorias, indicadores e documentos.'
        : 'Case de portfólio profissional desenvolvido para apresentar trabalho, trajetória, identidade visual e serviços com clareza.',
    image: project.coverImage,
    path: `/trabalhos/${project.slug}`,
  })
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const next = getNextProject(slug)

  return (
    <>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          '@id': `https://gandra.tech/trabalhos/${project.slug}#case`,
          name: project.name,
          headline: project.headline,
          description: project.overview,
          url: `https://gandra.tech/trabalhos/${project.slug}`,
          image: `https://gandra.tech${project.coverImage}`,
          inLanguage: 'pt-BR',
          creator: { '@id': 'https://gandra.tech#organization' },
          keywords: project.services,
        }}
      />
      <Header />
      <main id="main-content">
        <Breadcrumbs
          items={[
            { name: 'Início', href: '/' },
            { name: 'Trabalhos', href: '/trabalhos' },
            { name: project.name, href: `/trabalhos/${project.slug}` },
          ]}
        />
        <ProjectView project={project} next={next} />
      </main>
      <Footer />
    </>
  )
}
