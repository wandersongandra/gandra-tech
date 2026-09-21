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

function hashInlineScripts(html) {
  const hashes = new Set()
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
  let match

  while ((match = scriptPattern.exec(html)) !== null) {
    const attributes = match[1] || ''
    const body = match[2] || ''

    if (/\bsrc\s*=/.test(attributes)) continue
    if (!body.trim()) continue

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

const scriptHashes = new Set()
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  for (const hash of hashInlineScripts(html)) scriptHashes.add(hash)
}

if (!scriptHashes.size) {
  throw new Error('nenhum script inline foi encontrado; a CSP não pode ser gerada com segurança')
}

const sortedHashes = [...scriptHashes].sort()
const csp = [
  "default-src 'self'",
  `script-src 'self' ${sortedHashes.join(' ')} https://static.cloudflareinsights.com`,
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

const source = fs.readFileSync(headersPath, 'utf8')
const updated = source.replace(
  /^\s*Content-Security-Policy:.*$/m,
  `  Content-Security-Policy: ${csp}`
)

if (updated === source) {
  throw new Error('linha Content-Security-Policy não encontrada em out/_headers')
}

fs.writeFileSync(headersPath, updated)
console.log(`CSP estrita gerada com ${sortedHashes.length} hashes SHA-256 para ${htmlFiles.length} arquivos HTML.`)
