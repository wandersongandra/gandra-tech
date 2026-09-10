import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProjectView from '@/components/sections/ProjectView'
import { getProject, getNextProject, projects } from '@/lib/projects'

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}

  const canonical = `/trabalhos/${project.slug}`
  return {
    title: project.name,
    description: project.headline,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'article',
      url: canonical,
      title: project.name,
      description: project.headline,
      images: [{ url: project.coverImage, alt: `${project.name} — projeto Gandra Tech` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.name,
      description: project.headline,
      images: [project.coverImage],
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
