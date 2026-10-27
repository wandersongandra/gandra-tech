import type { Metadata, Viewport } from 'next'
import { Archivo, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import LenisProvider from '@/components/providers/LenisProvider'
import PageCurtain from '@/components/motion/PageCurtain'
import StudioCursor from '@/components/motion/StudioCursor'
import InkRipple from '@/components/motion/InkRipple'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import { contactEmail, brandName, siteDescription, siteName, siteUrl } from '@/lib/site'
import './globals.css'
import './materia.css'
import './case.css'

/*
 * Sistema tipográfico "Matéria" — todas as famílias são OFL (Google Fonts)
 * e o next/font baixa os arquivos no build: o site serve as fontes do
 * próprio domínio, sem CDN em runtime (font-src 'self').
 *
 * Archivo: grotesca variável com eixos de peso (100–900) e largura (62–125).
 * É a "matéria" do site: os eixos são animados pelo cursor e pelo scroll.
 */
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  axes: ['wdth'],
  display: 'swap',
  preload: true,
})

/* Instrument Serif itálico: a voz humana, usada só em palavras de acento. */
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  preload: false,
})

/* JetBrains Mono: anotações técnicas, índices e metadados. */
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Sites, sistemas e automações sob medida`,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName,
    title: `${siteName} — Sites, sistemas e automações sob medida`,
    description: siteDescription,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${siteName} — Sites, sistemas e automações sob medida` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — Sites, sistemas e automações sob medida`,
    description: siteDescription,
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: siteName,
    alternateName: brandName,
    url: siteUrl,
    description: siteDescription,
    logo: `${siteUrl}/apple-touch-icon.png`,
    areaServed: { '@type': 'Country', name: 'Brasil' },
    availableLanguage: 'pt-BR',
    contactPoint: {
      '@type': 'ContactPoint',
      email: contactEmail,
      contactType: 'sales',
      availableLanguage: 'pt-BR',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${siteUrl}#organization` },
  },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${instrumentSerif.variable} ${jetbrains.variable}`}>
      <body>
        {structuredData.map((data) => (
          <script key={data['@type']} type="application/ld+json">
            {JSON.stringify(data)}
          </script>
        ))}
        <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
        <ServiceWorkerRegister />
        <div className="grain" aria-hidden="true" />
        <PageCurtain />
        <StudioCursor />
        <InkRipple />
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
