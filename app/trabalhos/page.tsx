import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WorkIndex from '@/components/sections/WorkIndex'
import { projects } from '@/lib/projects'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Trabalhos',
  description: `Arquivo completo de projetos da Gandra Tech: ${projects
    .map((p) => p.name)
    .join(', ')}.`,
  path: '/trabalhos',
})

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
