const baseUrl = (process.env.PRODUCTION_URL || 'https://gandra.tech').replace(/\/$/, '')
const routes = [
  '/',
  '/servicos',
  '/trabalhos',
  '/trabalhos/sgs',
  '/trabalhos/telma-santos',
  '/contato',
  '/llms.txt',
  '/sitemap.xml',
  '/robots.txt',
  '/.well-known/security.txt',
]
const requiredHeaders = [
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'x-xss-protection',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'cross-origin-embedder-policy',
  'content-security-policy',
]
const requiredCspDirectives = [
  "default-src 'self'",
  "script-src-attr 'none'",
  "img-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  "worker-src 'none'",
  "media-src 'none'",
]
const failures = []

function validateSecurityHeaders(route, response) {
  for (const header of requiredHeaders) {
    if (!response.headers.has(header)) failures.push(`${route}: header ausente ${header}`)
  }

  const hsts = response.headers.get('strict-transport-security') || ''
  if (!hsts.includes('max-age=63072000') || !/includeSubDomains/i.test(hsts) || !/preload/i.test(hsts)) {
    failures.push(`${route}: HSTS abaixo da política esperada`)
  }

  if (response.headers.get('x-xss-protection') !== '0') {
    failures.push(`${route}: X-XSS-Protection deve estar desabilitado com valor 0`)
  }

  if (response.headers.has('x-powered-by')) {
    failures.push(`${route}: X-Powered-By expõe tecnologia desnecessariamente`)
  }

  if (response.headers.has('content-security-policy-report-only')) {
    failures.push(`${route}: CSP ainda está em modo Report-Only`)
  }

  const csp = response.headers.get('content-security-policy') || ''
  for (const directive of requiredCspDirectives) {
    if (!csp.includes(directive)) failures.push(`${route}: diretiva CSP ausente ${directive}`)
  }

  if (csp.includes("'unsafe-eval'")) {
    failures.push(`${route}: CSP permite unsafe-eval`)
  }

  if (response.headers.get('access-control-allow-origin') === '*') {
    failures.push(`${route}: CORS curinga não é permitido`)
  }
}

for (const route of routes) {
  const url = `${baseUrl}${route}`
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
    })

    if (response.status !== 200) failures.push(`${route}: HTTP ${response.status}`)
    validateSecurityHeaders(route, response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido'
    failures.push(`${route}: ${message}`)
  }
}

try {
  const notFoundRoute = '/__security-healthcheck-not-found__'
  const response = await fetch(`${baseUrl}${notFoundRoute}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
  })

  if (response.status !== 404) failures.push(`${notFoundRoute}: esperado HTTP 404, recebido ${response.status}`)
  validateSecurityHeaders(notFoundRoute, response)
} catch (error) {
  const message = error instanceof Error ? error.message : 'erro desconhecido'
  failures.push(`404 de segurança: ${message}`)
}

try {
  const response = await fetch(`${baseUrl}/sw.js`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
  })
  const cacheControl = response.headers.get('cache-control') || ''
  const body = await response.text()

  if (response.status !== 200) failures.push(`/sw.js: HTTP ${response.status}`)
  if (!/no-store/i.test(cacheControl)) failures.push('/sw.js: Cache-Control precisa conter no-store')
  if (!body.includes('self.registration.unregister()')) failures.push('/sw.js: worker de retirada não confirmado')
} catch (error) {
  const message = error instanceof Error ? error.message : 'erro desconhecido'
  failures.push(`/sw.js: ${message}`)
}

if (baseUrl === 'https://gandra.tech') {
  try {
    const response = await fetch('http://gandra.tech/', {
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
    })
    const location = response.headers.get('location') || ''

    if (![301, 302, 307, 308].includes(response.status)) {
      failures.push(`HTTP sem TLS: esperado redirect, recebido ${response.status}`)
    }
    if (!location.startsWith('https://gandra.tech')) {
      failures.push(`HTTP sem TLS: destino inesperado ${location || '(ausente)'}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido'
    failures.push(`redirect HTTP→HTTPS: ${message}`)
  }
}

if (failures.length) {
  console.error('Healthcheck de produção falhou:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(
    `Healthcheck de produção passou: ${routes.length} URLs, 404, CSP, worker de retirada e redirect HTTPS validados.`,
  )
}
