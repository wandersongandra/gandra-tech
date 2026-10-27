import { media, type MediaEntry } from './media.generated'

/**
 * Direção de arte por imagem: ponto focal (object-position) para recortes
 * em molduras de outra proporção e o "tom" do fundo da foto, usado para
 * escolher a moldura do hero do case (fotos de estúdio em fundo preto
 * entram num painel de tinta, sem corte; interfaces mantêm a proporção).
 * Fica fora de lib/projects.ts para não mexer na estrutura dos cases.
 */
type ArtDirection = {
  /** object-position quando a moldura recorta a imagem. */
  focus?: string
  /** Fundo predominante da foto (para emendar a moldura). */
  tone?: 'dark' | 'light'
  /** Cor do palco quando o canto da foto não representa o fundo (vinheta). */
  bg?: string
}

const art: Record<string, ArtDirection> = {
  '/images/work/sgs.webp': { focus: '50% 0%', tone: 'light' },
  '/images/projects/sgs/cover.webp': { focus: '50% 35%', tone: 'dark' },
  '/images/projects/sgs/main.webp': { focus: '50% 20%', tone: 'dark' },
  '/images/projects/telma-santos/work.webp': { focus: '50% 22%', tone: 'dark' },
  '/images/projects/telma-santos/main.webp': { focus: '50% 18%', tone: 'dark' },
  '/images/projects/telma-santos/cover.webp': { focus: '50% 16%', tone: 'dark', bg: '#1f1915' },
  '/images/projects/gisley-nunes/work.webp': { focus: '40% 60%' },
  '/images/projects/gisley-nunes/main.webp': { focus: '55% 50%' },
  '/images/projects/gisley-nunes/cover.webp': { focus: '45% 62%' },
  '/images/projects/ajn/work.webp': { focus: '48% 38%' },
  '/images/projects/ajn/main.webp': { focus: '30% 45%' },
  '/images/projects/ajn/cover.webp': { focus: '62% 62%' },
}

export type MediaInfo = MediaEntry & ArtDirection & {
  src: string
  ratio: number
  orientation: 'portrait' | 'landscape'
}

export function getMedia(src: string): MediaInfo | undefined {
  const entry = media[src]
  if (!entry) return undefined
  const ratio = entry.width / entry.height
  return {
    ...entry,
    ...art[src],
    src,
    ratio,
    orientation: ratio < 1 ? 'portrait' : 'landscape',
  }
}

export function srcSet(info: MediaEntry, format: 'avif' | 'webp') {
  return info.widths.map((w) => `${info.base}-${w}.${format} ${w}w`).join(', ')
}

/** Fallback do <img>: a maior variante até ~1080px (ou a única que houver). */
export function fallbackSrc(info: MediaEntry) {
  const pick = [...info.widths].reverse().find((w) => w <= 1100) ?? info.widths[0]
  return `${info.base}-${pick}.webp`
}
