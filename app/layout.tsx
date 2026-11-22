import type { Metadata, Viewport } from 'next'
import { Archivo, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import LenisProvider from '@/components/providers/LenisProvider'
import PageCurtain from '@/components/motion/PageCurtain'
import StudioCursor from '@/components/motion/StudioCursor'
import InkRipple from '@/components/motion/InkRipple'
import SurrealLoader from '@/components/surreal/SurrealLoader'
import Intro from '@/components/surreal/Intro'
import { INTRO_SCRIPT } from '@/lib/intro'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import ScrollMemory from '@/components/ScrollMemory'
import StructuredData from '@/components/StructuredData'
import { contactEmail, brandName, siteDescription, siteName, siteTitle, siteUrl, whatsappNumber } from '@/lib/site'
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

/*
 * Instrument Serif itálico: a voz humana, usada só em palavras de acento.
 * Todas as regras com var(--m-italic)/var(--font-italic) são itálicas (o <em>
 * do formulário herda o itálico do navegador), então só esse estilo é baixado.
 * Pré-carregada porque aparece no H1 da home ("evoluir") e nos títulos dos
 * cases: chegando cedo, não troca de fonte depois do primeiro paint (CLS).
 */
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: '400',
  style: ['italic'],
  display: 'swap',
  preload: true,
})

/*
 * JetBrains Mono: anotações técnicas, índices e metadados. 'optional': se não
 * chegar no período curto de bloqueio, a página fica com o fallback mono e não
 * troca no meio da leitura (era a principal fonte de CLS em cases e serviços);
 * o arquivo fica em cache para as próximas páginas. Pré-carregada: sem preload
 * ela era pedida só depois do CSS e perdia a janela do 'optional' até em rede
 * rápida — o primeiro acesso ficava sem a tipografia da marca nos rótulos.
 */
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'optional',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${brandName}`,
  },
  description: siteDescription,
  robots: { index: true, follow: true },
  // Cada página declara seu próprio canonical; não herdar a home para novas rotas.
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${siteName} — Sites, sistemas e automações sob medida` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ece8df' },
    { media: '(prefers-color-scheme: dark)', color: '#12110e' },
  ],
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
      ...(whatsappNumber ? { telephone: `+${whatsappNumber}` } : {}),
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
    <html lang="pt-BR" className={`${archivo.variable} ${instrumentSerif.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script>{INTRO_SCRIPT}</script>
      </head>
      <body>
        <Intro />
        <StructuredData data={structuredData} />
        <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
        <ServiceWorkerRegister />
        <div className="grain" aria-hidden="true" />
        <PageCurtain />
        <StudioCursor />
        <InkRipple />
        <SurrealLoader />
        <ScrollMemory />
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
