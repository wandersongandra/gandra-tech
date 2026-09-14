import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProjectView from '@/components/sections/ProjectView'
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
    title: project.name,
    description: project.headline,
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
      <Header />
      <main id="main-content">
        <ProjectView project={project} next={next} />
      </main>
      <Footer />
    </>
  )
}
