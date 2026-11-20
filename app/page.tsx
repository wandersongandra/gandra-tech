import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import WorkList from '@/components/sections/WorkList'
import Contact from '@/components/sections/Contact'
import Process from '@/components/sections/Process'
import Stack from '@/components/sections/Stack'
import ClientMarquee from '@/components/materia/ClientMarquee'
import { DeferredManifesto } from '@/components/sections/HomeDeferredMotion'
import StructuredData from '@/components/StructuredData'
import HashScroll from '@/components/HashScroll'
import type { Metadata } from 'next'
import { createServiceJsonLd } from '@/lib/seo'
import { services } from '@/lib/services'
import { siteDescription, siteUrl } from '@/lib/site'

// A home usa o título padrão do layout, já com marca ao final.
export const metadata: Metadata = { alternates: { canonical: siteUrl } }

export default function Home() {
  return (
    <>
      <StructuredData
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Gandra Tecnologia — Sites, sistemas e automações sob medida',
            url: siteUrl,
            description: siteDescription,
            inLanguage: 'pt-BR',
          },
          ...services.map(createServiceJsonLd),
        ]}
      />
      <Header />
      <main id="main-content">
        <Hero />
        <ClientMarquee />
        <Services />
        <WorkList />
        <DeferredManifesto />
        <Stack />
        <Process />
        <Contact />
      </main>
      <Footer />
      <HashScroll />
    </>
  )
}
