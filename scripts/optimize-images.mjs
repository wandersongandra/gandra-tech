/**
 * Pipeline de imagens responsivas (rodar à mão quando um asset mudar):
 *
 *   node scripts/optimize-images.mjs
 *
 * Para cada imagem de projeto gera variantes AVIF e WebP em larguras fixas
 * (sem nunca ampliar a fonte) em public/images/r/ e escreve o manifesto
 * lib/media.generated.ts, usado pelo componente <Picture> para montar
 * srcset, sizes, width/height (CLS 0) e o fallback.
 *
 * Os arquivos gerados são versionados: o build do Cloudflare Pages e o CI
 * rodam com --ignore-scripts e não dependem do sharp.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const outRoot = path.join(root, 'public/images/r')
const WIDTHS = [480, 768, 1080, 1440, 1920]

/** src público -> arquivo-fonte de maior qualidade disponível + tipo de conteúdo. */
const sources = {
  '/images/work/sgs.webp': { file: 'public/images/work/sgs.png', kind: 'ui' },
  '/images/projects/sgs/cover.webp': { file: 'public/images/projects/sgs/cover.png', kind: 'ui' },
  '/images/projects/sgs/main.webp': { file: 'public/images/projects/sgs/main.png', kind: 'ui' },
  '/images/projects/telma-santos/work.webp': { kind: 'photo' },
  '/images/projects/telma-santos/main.webp': { kind: 'photo' },
  '/images/projects/telma-santos/cover.webp': { kind: 'photo' },
  '/images/projects/gisley-nunes/work.webp': { kind: 'photo' },
  '/images/projects/gisley-nunes/main.webp': { kind: 'photo' },
  '/images/projects/gisley-nunes/cover.webp': { kind: 'photo' },
  '/images/projects/ajn/work.webp': { kind: 'photo' },
  '/images/projects/ajn/main.webp': { kind: 'photo' },
  '/images/projects/ajn/cover.webp': { kind: 'photo' },
  // Capturas 2× dos sites no ar (Playwright, 1440×900 e 390×844), sem banners.
  '/images/projects/ajn/site-desktop.webp': { kind: 'ui' },
  '/images/projects/ajn/site-mobile.webp': { kind: 'ui' },
  '/images/projects/telma-santos/site-desktop.webp': { kind: 'ui' },
  '/images/projects/telma-santos/site-mobile.webp': { kind: 'ui' },
  '/images/projects/gisley-nunes/site-desktop.webp': { kind: 'ui' },
  '/images/projects/gisley-nunes/site-mobile.webp': { kind: 'ui' },
}

// Interfaces têm texto pequeno: compressão mais leve para não borrar.
const QUALITY = {
  ui: { avif: 62, webp: 86 },
  photo: { avif: 52, webp: 78 },
}

const manifest = {}
let totalIn = 0

// --manifest-only: regrava só o manifesto, sem reencodar as variantes.
const manifestOnly = process.argv.includes('--manifest-only')
if (!manifestOnly) await fs.rm(outRoot, { recursive: true, force: true })

for (const [src, cfg] of Object.entries(sources)) {
  const input = path.join(root, cfg.file ?? path.join('public', src))
  const meta = await sharp(input).metadata()
  const widths = [...new Set([...WIDTHS.filter((w) => w < meta.width * 0.92), meta.width])].sort((a, b) => a - b)
  const base = src.replace(/^\/images\//, '').replace(/\.[a-z]+$/i, '')
  const dir = path.join(outRoot, path.dirname(base))
  await fs.mkdir(dir, { recursive: true })
  totalIn += (await fs.stat(path.join(root, 'public', src))).size

  for (const w of manifestOnly ? [] : widths) {
    const pipeline = sharp(input).resize({ width: w, withoutEnlargement: true })
    const stem = path.join(outRoot, `${base}-${w}`)
    await pipeline.clone().avif({ quality: QUALITY[cfg.kind].avif, effort: 4 }).toFile(`${stem}.avif`)
    await pipeline.clone().webp({ quality: QUALITY[cfg.kind].webp, effort: 5 }).toFile(`${stem}.webp`)
    
  }

  // Cor do canto superior esquerdo: a moldura do case usa como fundo para
  // emendar fotos de estúdio (fundo preto) sem borda visível.
  // (stats() precisa do recorte já materializado num buffer.)
  const cornerBuf = await sharp(input).extract({ left: 0, top: 0, width: 24, height: 24 }).png().toBuffer()
  const corner = await sharp(cornerBuf).stats()
  const bg = '#' + corner.channels.slice(0, 3).map((c) => Math.round(c.mean).toString(16).padStart(2, '0')).join('')

  manifest[src] = { base: `/images/r/${base}`, width: meta.width, height: meta.height, widths, kind: cfg.kind, bg }
  console.log(`${src}: ${meta.width}x${meta.height} -> ${widths.join(', ')}`)
}

const body = `// Gerado por scripts/optimize-images.mjs — não editar à mão.
export type MediaKind = 'ui' | 'photo'
export type MediaEntry = { base: string; width: number; height: number; widths: number[]; kind: MediaKind; bg: string }

export const media: Record<string, MediaEntry> = ${JSON.stringify(manifest, null, 2)}
`
await fs.writeFile(path.join(root, 'lib/media.generated.ts'), body)
console.log(`Manifesto: ${Object.keys(manifest).length} imagens. Fontes WebP: ${(totalIn / 1024).toFixed(0)} KiB.`)
