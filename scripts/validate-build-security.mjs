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
const expectedPublicFiles = ['_headers', 'robots.txt', 'sitemap.xml', 'llms.txt']
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

  const sensitiveFiles = files.filter((file) => /(^|[\\/])\.env(?:\.|$)|\.(pem|key|p12|pfx|sql|dump|bak|log)$/i.test(file))
  if (sensitiveFiles.length) failures.push(`arquivos potencialmente sensíveis encontrados no export: ${sensitiveFiles.length}`)

  const headersPath = path.join(outDir, '_headers')
  const headers = fs.readFileSync(headersPath, 'utf8')
  const requiredHeaders = [
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Strict-Transport-Security:',
    'Referrer-Policy:',
    'Permissions-Policy:',
    'Cross-Origin-Opener-Policy: same-origin',
    'Cross-Origin-Resource-Policy: same-origin',
    'Cross-Origin-Embedder-Policy: require-corp',
    'Access-Control-Allow-Origin: https://gandra.tech',
    'Content-Security-Policy:',
  ]

  for (const header of requiredHeaders) {
    if (!headers.includes(header)) failures.push(`header de segurança ausente em out/_headers: ${header}`)
  }

  if (headers.includes('Content-Security-Policy-Report-Only:')) {
    failures.push('política CSP ainda está em modo Report-Only')
  }

  if (headers.includes('Access-Control-Allow-Origin: *')) {
    failures.push('CORS curinga não é permitido no export')
  }
}

if (failures.length) {
  console.error('Validação de segurança do export falhou:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Validação de segurança do export passou: ${expectedRoutes.length} rotas, headers presentes e nenhum source map.`)
}
