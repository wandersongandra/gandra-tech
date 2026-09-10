import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WorkIndex from '@/components/sections/WorkIndex'
import { projects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Trabalhos',
  description: `Arquivo completo de projetos da Gandra Tech: ${projects
    .map((p) => p.name)
    .join(', ')}.`,
  alternates: {
    canonical: '/trabalhos',
  },
}

export default function Trabalhos() {
  return (
    <>
      <Header />
      <main id="main-content">
        <WorkIndex />
      </main>
      <Footer />
    </>
  )
}
