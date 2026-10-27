import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import WorkList from '@/components/sections/WorkList'
import Contact from '@/components/sections/Contact'
import Process from '@/components/sections/Process'
import ClientMarquee from '@/components/materia/ClientMarquee'
import { DeferredManifesto } from '@/components/sections/HomeDeferredMotion'
import StructuredData from '@/components/StructuredData'
import { createServiceJsonLd } from '@/lib/seo'
import { services } from '@/lib/services'
import { siteDescription, siteUrl } from '@/lib/site'

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
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
