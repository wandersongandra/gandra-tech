import fs from 'node:fs/promises'
import path from 'node:path'
import satori from 'satori'
import sharp from 'sharp'

const root = process.cwd()
const outputDir = path.join(root, 'public', 'og')

const routes = [
  { file: 'home.png', eyebrow: 'GANDRA / TECH', title: ['Sites e sistemas sob', 'medida para negócios.'], descriptor: 'ESTÚDIO DE SOFTWARE DIGITAL', footer: 'INTERFACES · SISTEMAS · EXPERIÊNCIAS' },
  { file: 'servicos.png', eyebrow: '01 / SERVIÇOS', title: ['Serviços de', 'desenvolvimento web.'], descriptor: 'SITES · SISTEMAS · AUTOMAÇÕES', footer: 'PARA EMPRESAS E PROFISSIONAIS' },
  { file: 'trabalhos.png', eyebrow: '02 / TRABALHOS', title: ['Portfólio de sites', 'e sistemas.'], descriptor: 'PROJETOS PUBLICADOS', footer: 'ESTRATÉGIA · DESIGN · ENGENHARIA WEB' },
  { file: 'sgs.png', eyebrow: 'TRABALHO / SGS SEGURANÇA', title: ['SGS Segurança,', 'plataforma digital.'], descriptor: 'PRODUTO · UX / UI · ENGENHARIA WEB', footer: 'CASE DE PROJETO' },
  { file: 'telma-santos.png', eyebrow: 'TRABALHO / TELMA SANTOS', title: ['Portfólio', 'Telma Santos.'], descriptor: 'ESTRATÉGIA VISUAL · DESIGN DE INTERFACE', footer: 'CASE DE PROJETO' },
  { file: 'contato.png', eyebrow: '03 / CONTATO', title: ['Vamos conversar', 'sobre seu projeto.'], descriptor: 'ATENDIMENTO REMOTO EM TODO O BRASIL', footer: 'CONTATO@GANDRA.TECH' },
]

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}

function dotGrid() {
  return Array.from({ length: 72 }, (_, index) => {
    const column = index % 12
    const row = Math.floor(index / 12)
    return {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          left: 150 + column * 78,
          top: 155 + row * 42,
          width: 2,
          height: 2,
          borderRadius: 999,
          backgroundColor: column % 5 === 0 ? '#8f97dd' : '#f5f4f1',
          opacity: column % 5 === 0 ? 0.45 : 0.2,
        },
      },
    }
  })
}

function createMarkup(route) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        backgroundColor: '#000000',
        color: '#f5f4f1',
        padding: '30px 84px',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              display: 'flex',
              left: 30,
              top: 30,
              width: 1140,
              height: 570,
              border: '1px solid rgba(245,244,241,0.16)',
              backgroundImage: 'radial-gradient(circle at 50% 48%, #525977 0%, #171925 55%, #000000 100%)',
            },
            children: dotGrid(),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 4,
            },
            children: [
              { type: 'div', props: { children: route.eyebrow } },
              { type: 'div', props: { children: route.descriptor, style: { fontSize: 15, letterSpacing: 3 } } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              marginTop: 150,
              fontFamily: 'Bodoni Moda',
              fontSize: 76,
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: -2,
            },
            children: route.title.map((line) => ({ type: 'div', props: { children: line } })),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 84,
              right: 84,
              bottom: 78,
              height: 1,
              backgroundColor: 'rgba(245,244,241,0.28)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 84,
              bottom: 42,
              fontSize: 16,
              letterSpacing: 2,
              opacity: 0.68,
            },
            children: route.footer,
          },
        },
      ],
    },
  }
}

const [displayFont, sansFont] = await Promise.all([
  fs.readFile(path.join(root, 'node_modules', '@fontsource', 'bodoni-moda', 'files', 'bodoni-moda-latin-400-normal.woff')),
  fs.readFile(path.join(root, 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-400-normal.woff')),
])

const fonts = [
  { name: 'Bodoni Moda', data: toArrayBuffer(displayFont), weight: 400, style: 'normal' },
  { name: 'Inter', data: toArrayBuffer(sansFont), weight: 400, style: 'normal' },
]

await fs.mkdir(outputDir, { recursive: true })

for (const route of routes) {
  const svg = await satori(createMarkup(route), { width: 1200, height: 630, fonts })
  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, route.file))
}

console.log(`OG images geradas: ${routes.map((route) => route.file).join(', ')}`)
