import type { Metadata, Viewport } from 'next'
import { Bodoni_Moda, Cormorant_Garamond, Inter } from 'next/font/google'
import LenisProvider from '@/components/providers/LenisProvider'
import CustomCursor from '@/components/motion/CustomCursor'
import PageCurtain from '@/components/motion/PageCurtain'
import VelocityWarp from '@/components/motion/VelocityWarp'
import ChaosMode from '@/components/motion/ChaosMode'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import { assetBaseUrl, contactEmail, brandName, siteDescription, siteName, siteUrl } from '@/lib/site'
import './globals.css'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  preload: false,
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  preload: true,
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
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
    images: [{ url: `${assetBaseUrl}/og/home.png`, width: 1200, height: 630, alt: `${siteName} — Sites, sistemas e automações sob medida` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — Sites, sistemas e automações sob medida`,
    description: siteDescription,
    images: [`${assetBaseUrl}/og/home.png`],
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
    <html lang="pt-BR" className={`${bodoni.variable} ${cormorant.variable} ${inter.variable}`}>
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
        <CustomCursor />
        <LenisProvider>
          <VelocityWarp>{children}</VelocityWarp>
          <ChaosMode />
        </LenisProvider>
      </body>
    </html>
  )
}
