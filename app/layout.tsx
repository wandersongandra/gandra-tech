import type { Metadata } from 'next'
import { Bodoni_Moda, Cormorant_Garamond, Inter } from 'next/font/google'
import LenisProvider from '@/components/providers/LenisProvider'
import CustomCursor from '@/components/motion/CustomCursor'
import PageCurtain from '@/components/motion/PageCurtain'
import VelocityWarp from '@/components/motion/VelocityWarp'
import ChaosMode from '@/components/motion/ChaosMode'
import { siteDescription, siteName, siteUrl } from '@/lib/site'
import './globals.css'
import './accessibility.css'
import './responsive.css'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Estúdio de Software Digital`,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName,
    title: `${siteName} — Estúdio de Software Digital`,
    description: siteDescription,
  },
  twitter: {
    card: 'summary',
    title: `${siteName} — Estúdio de Software Digital`,
    description: siteDescription,
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${bodoni.variable} ${cormorant.variable} ${inter.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          Pular para o conteúdo
        </a>
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
