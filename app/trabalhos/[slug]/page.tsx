import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProjectView from '@/components/sections/ProjectView'
import { getProject, getNextProject, projects } from '@/lib/projects'

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: project.name,
    description: project.headline,
    openGraph: {
      title: project.name,
      description: project.headline,
      images: [{ url: project.coverImage, alt: `${project.name} — projeto Gandra Tech` }],
    },
  }
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
