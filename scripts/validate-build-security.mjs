import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const expectedRoutes = [
  '/',
  '/servicos',
  '/trabalhos',
  '/trabalhos/sgs',
  '/trabalhos/telma-santos',
  '/contato',
  '/termos-de-uso',
  '/politica-de-privacidade',
]
const expectedPublicFiles = ['_headers', 'robots.txt', 'sitemap.xml', 'llms.txt', 'sw.js']
const failures = []

function exists(relativePath) {
  return fs.existsSync(path.join(outDir, relativePath))
}

function routeExists(route) {
  if (route === '/') return exists('index.html')
  const normalized = route.replace(/^\//, '')
  return exists(path.join(normalized, 'index.html')) || exists(`${normalized}.html`)
}

function collectFiles(directory) {
  const files = []
  if (!fs.existsSync(directory)) return files

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...collectFiles(absolute))
    else files.push(absolute)
  }

  return files
}

if (!fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory()) {
  failures.push('a pasta out/ não foi gerada')
} else {
  for (const route of expectedRoutes) {
    if (!routeExists(route)) failures.push(`rota ausente no export: ${route}`)
  }

  for (const file of expectedPublicFiles) {
    if (!exists(file)) failures.push(`arquivo público ausente no export: ${file}`)
  }

  const files = collectFiles(outDir)
  const sourceMaps = files.filter((file) => file.toLowerCase().endsWith('.map'))
  if (sourceMaps.length) failures.push(`source maps encontrados no export: ${sourceMaps.length}`)

  const sensitiveFiles = files.filter((file) =>
    /(^|[\\/])\.env(?:\.|$)|\.(pem|key|p12|pfx|sql|dump|bak|log)$/i.test(file),
  )
  if (sensitiveFiles.length) {
    failures.push(`arquivos potencialmente sensíveis encontrados no export: ${sensitiveFiles.length}`)
  }

  const htmlFiles = files.filter((file) => file.toLowerCase().endsWith('.html'))
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8')
    const relative = path.relative(outDir, file)

    if (/\son[a-z]+\s*=/i.test(html)) {
      failures.push(`handler JavaScript inline encontrado em ${relative}`)
    }

    if (/(?:href|src)\s*=\s*["']\s*javascript:/i.test(html)) {
      failures.push(`URL javascript: encontrada em ${relative}`)
    }
  }

  const headersPath = path.join(outDir, '_headers')
  const headers = fs.readFileSync(headersPath, 'utf8')
  const requiredHeaders = [
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'X-XSS-Protection: 0',
    'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy:',
    'Cross-Origin-Opener-Policy: same-origin',
    'Cross-Origin-Resource-Policy: same-origin',
    'Cross-Origin-Embedder-Policy: require-corp',
    'Content-Security-Policy:',
  ]

  for (const header of requiredHeaders) {
    if (!headers.includes(header)) failures.push(`header de segurança ausente em out/_headers: ${header}`)
  }

  const requiredCspDirectives = [
    "default-src 'self'",
    "script-src-attr 'none'",
    "img-src 'self' data:",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "child-src 'none'",
    "worker-src 'none'",
    "media-src 'none'",
    'upgrade-insecure-requests',
  ]

  for (const directive of requiredCspDirectives) {
    if (!headers.includes(directive)) failures.push(`diretiva CSP obrigatória ausente: ${directive}`)
  }

  if (headers.includes("'unsafe-eval'")) {
    failures.push("CSP não pode permitir 'unsafe-eval'")
  }

  if (headers.includes('Content-Security-Policy-Report-Only:')) {
    failures.push('política CSP ainda está em modo Report-Only')
  }

  if (/^\s*Access-Control-Allow-Origin:/mi.test(headers)) {
    failures.push('CORS global não deve ser habilitado no site estático')
  }

  const worker = fs.readFileSync(path.join(outDir, 'sw.js'), 'utf8')
  if (!worker.includes('self.registration.unregister()')) {
    failures.push('sw.js não está configurado como worker de retirada')
  }

  if (!headers.includes('/sw.js') || !headers.includes('Cache-Control: no-store, max-age=0')) {
    failures.push('sw.js precisa ser servido com Cache-Control: no-store')
  }
}

if (failures.length) {
  console.error('Validação de segurança do export falhou:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(
    `Validação de segurança do export passou: ${expectedRoutes.length} rotas, CSP endurecida, nenhum source map e nenhum sink inline.`,
  )
}
