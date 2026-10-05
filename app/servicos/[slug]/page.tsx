import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumbs from '@/components/Breadcrumbs'
import StructuredData from '@/components/StructuredData'
import ServiceDetail from '@/components/sections/ServiceDetail'
import { createPageMetadata, createServiceJsonLd } from '@/lib/seo'
import { getService, services } from '@/lib/services'
import { siteUrl } from '@/lib/site'

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) return {}

  return createPageMetadata({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/servicos/${service.slug}`,
  })
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()

  return (
    <>
      <StructuredData
        data={[
          createServiceJsonLd(service),
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            '@id': `${siteUrl}/servicos/${service.slug}#faq`,
            url: `${siteUrl}/servicos/${service.slug}`,
            mainEntity: service.faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          },
        ]}
      />
      <Header />
      <main id="main-content">
        <Breadcrumbs
          items={[
            { name: 'Início', href: '/' },
            { name: 'Serviços', href: '/servicos' },
            { name: service.title, href: `/servicos/${service.slug}` },
          ]}
        />
        <ServiceDetail service={service} />
      </main>
      <Footer />
    </>
  )
}
