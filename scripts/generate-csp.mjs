import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const headersPath = path.join(outDir, '_headers')

function collectHtmlFiles(directory) {
  const files = []
  if (!fs.existsSync(directory)) return files

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...collectHtmlFiles(absolute))
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) files.push(absolute)
  }

  return files
}

function isHtmlSpace(char) {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f'
}

function isTagBoundary(char) {
  return char === '>' || isHtmlSpace(char)
}

function findTagEnd(html, start) {
  let quote = null

  for (let index = start; index < html.length; index += 1) {
    const char = html[index]

    if (quote) {
      if (char === quote) quote = null
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === '>') return index
  }

  return -1
}

function findClosingScript(lowerHtml, start) {
  let cursor = start

  while (cursor < lowerHtml.length) {
    const candidate = lowerHtml.indexOf('</script', cursor)
    if (candidate === -1) return -1

    const boundary = lowerHtml[candidate + '</script'.length]
    if (boundary === undefined || isTagBoundary(boundary)) return candidate

    cursor = candidate + '</script'.length
  }

  return -1
}

function collectInlineScriptBodies(html) {
  const lowerHtml = html.toLowerCase()
  const bodies = []
  let cursor = 0

  while (cursor < html.length) {
    const open = lowerHtml.indexOf('<script', cursor)
    if (open === -1) break

    const boundary = lowerHtml[open + '<script'.length]
    if (boundary !== undefined && !isTagBoundary(boundary)) {
      cursor = open + '<script'.length
      continue
    }

    const openEnd = findTagEnd(html, open + '<script'.length)
    if (openEnd === -1) {
      throw new Error('tag <script> sem fechamento no HTML exportado')
    }

    const closeStart = findClosingScript(lowerHtml, openEnd + 1)
    if (closeStart === -1) {
      throw new Error('tag <script> sem </script> correspondente no HTML exportado')
    }

    const closeEnd = findTagEnd(html, closeStart + '</script'.length)
    if (closeEnd === -1) {
      throw new Error('tag </script> sem fechamento no HTML exportado')
    }

    const closingSuffix = html.slice(closeStart + '</script'.length, closeEnd)
    if ([...closingSuffix].some((char) => !isHtmlSpace(char))) {
      throw new Error('tag </script> malformada no HTML exportado')
    }

    const body = html.slice(openEnd + 1, closeStart)
    const openTag = html.slice(open, openEnd + 1)
    if (body.trim()) bodies.push({ body, openTag })

    cursor = closeEnd + 1
  }

  return bodies
}

// JSON-LD e outros blocos de dados não são executados pelo navegador e não
// precisam de hash na CSP. Só scripts executáveis entram em script-src.
function isExecutableScript(openTag) {
  const match = openTag.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)
  if (!match) return true
  const type = match[1].toLowerCase()
  return type === 'module' || type === 'text/javascript' || type === 'application/javascript'
}

function hashInlineScripts(html) {
  const hashes = new Set()

  for (const { body, openTag } of collectInlineScriptBodies(html)) {
    if (!isExecutableScript(openTag)) continue
    const digest = crypto.createHash('sha256').update(body, 'utf8').digest('base64')
    hashes.add(`'sha256-${digest}'`)
  }

  return hashes
}

if (!fs.existsSync(outDir)) {
  throw new Error('out/ não existe. Execute o build do Next.js antes de gerar a CSP.')
}

if (!fs.existsSync(headersPath)) {
  throw new Error('out/_headers não existe. O arquivo public/_headers deve ser copiado pelo build.')
}

const htmlFiles = collectHtmlFiles(outDir)
if (!htmlFiles.length) {
  throw new Error('nenhum HTML exportado foi encontrado para geração da CSP')
}

// O Cloudflare Pages ignora silenciosamente qualquer linha do _headers com
// mais de 2.000 caracteres. Uma CSP única com os hashes de todas as páginas
// passava desse limite e deixava a produção sem CSP. Por isso cada rota HTML
// recebe a própria política, só com os hashes dela.
const MAX_HEADER_LINE = 2000

function buildCsp(hashes) {
  const sortedHashes = [...hashes].sort()
  return [
    "default-src 'self'",
    `script-src 'self' ${sortedHashes.join(' ')} https://static.cloudflareinsights.com`.replace(/\s+/g, ' '),
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    "media-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
}

function routeForHtml(file) {
  const relative = path.relative(outDir, file).split(path.sep).join('/')
  if (relative === 'index.html') return '/'
  return `/${relative.replace(/(?:\/index)?\.html$/i, '')}`
}

function assertLine(line, label) {
  if (line.length > MAX_HEADER_LINE) {
    throw new Error(`${label}: linha com ${line.length} caracteres excede o limite de ${MAX_HEADER_LINE} do Cloudflare Pages`)
  }
  return line
}

const pages = []
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  pages.push({ route: routeForHtml(file), hashes: hashInlineScripts(html) })
}

const executablePages = pages.filter((page) => page.hashes.size)
if (!executablePages.length) {
  throw new Error('nenhum script inline foi encontrado; a CSP não pode ser gerada com segurança')
}

// A política global cobre o 404 (servido para qualquer rota desconhecida).
const fallback = pages.find((page) => page.route === '/404')
const fallbackCsp = buildCsp(fallback ? fallback.hashes : new Set())

const marker = '# CSP por rota (gerado por scripts/generate-csp.mjs)'
// Idempotente: remove blocos gerados numa execução anterior.
const source = fs.readFileSync(headersPath, 'utf8').split(marker)[0]
const withFallback = source.replace(
  /^\s*Content-Security-Policy:.*$/m,
  assertLine(`  Content-Security-Policy: ${fallbackCsp}`, '/*')
)

if (withFallback === source) {
  throw new Error('linha Content-Security-Policy não encontrada em out/_headers')
}

const routeBlocks = executablePages
  .filter((page) => page.route !== '/404')
  .sort((a, b) => a.route.localeCompare(b.route))
  .map((page) => [
    page.route,
    '  ! Content-Security-Policy',
    assertLine(`  Content-Security-Policy: ${buildCsp(page.hashes)}`, page.route),
  ].join('\n'))

const ruleCount = (withFallback.match(/^\S.*$/gm) || []).length + routeBlocks.length
if (ruleCount > 100) {
  throw new Error(`_headers teria ${ruleCount} regras; o limite do Cloudflare Pages é 100`)
}

fs.writeFileSync(headersPath, `${withFallback.trimEnd()}\n\n${marker}\n${routeBlocks.join('\n\n')}\n`)
const totalHashes = new Set(pages.flatMap((page) => [...page.hashes])).size
console.log(`CSP estrita gerada por rota: ${routeBlocks.length} rotas + fallback, ${totalHashes} hashes SHA-256 em ${htmlFiles.length} arquivos HTML.`)
