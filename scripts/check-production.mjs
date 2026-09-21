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
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'cross-origin-embedder-policy',
  'content-security-policy',
]
const failures = []

function validateCsp(csp, route) {
  if (!csp) return

  const directives = new Map(
    csp
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...values] = part.split(/\s+/)
        return [name, values]
      })
  )

  const scriptSrc = directives.get('script-src') || []
  const imageSrc = directives.get('img-src') || []

  if (scriptSrc.includes("'unsafe-inline'")) failures.push(`${route}: script-src contém unsafe-inline`)
  if (scriptSrc.includes("'unsafe-eval'")) failures.push(`${route}: script-src contém unsafe-eval`)
  if (!scriptSrc.some((value) => value.startsWith("'sha256-"))) {
    failures.push(`${route}: script-src sem hashes SHA-256`)
  }
  if ((directives.get('script-src-attr') || []).join(' ') !== "'none'") {
    failures.push(`${route}: script-src-attr não bloqueia handlers inline`)
  }
  if (imageSrc.includes('https:') || imageSrc.includes('*')) {
    failures.push(`${route}: img-src permissivo demais`)
  }
  if ((directives.get('base-uri') || []).join(' ') !== "'none'") {
    failures.push(`${route}: base-uri não está bloqueado`)
  }
  if ((directives.get('form-action') || []).join(' ') !== "'none'") {
    failures.push(`${route}: form-action não está bloqueado`)
  }
  if ((directives.get('object-src') || []).join(' ') !== "'none'") {
    failures.push(`${route}: object-src não está bloqueado`)
  }
  if ((directives.get('frame-ancestors') || []).join(' ') !== "'none'") {
    failures.push(`${route}: frame-ancestors não está bloqueado`)
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

    for (const header of requiredHeaders) {
      if (!response.headers.has(header)) failures.push(`${route}: header ausente ${header}`)
    }

    if (response.headers.has('content-security-policy-report-only')) {
      failures.push(`${route}: CSP ainda está em modo Report-Only`)
    }

    if (response.headers.get('access-control-allow-origin') === '*') {
      failures.push(`${route}: CORS curinga não é permitido`)
    }

    if (response.headers.has('x-xss-protection')) {
      failures.push(`${route}: X-XSS-Protection legado ainda está presente`)
    }

    if (response.headers.has('x-powered-by')) {
      failures.push(`${route}: X-Powered-By expõe tecnologia do servidor`)
    }

    validateCsp(response.headers.get('content-security-policy'), route)

    if (route === '/.well-known/security.txt' && response.ok) {
      const body = await response.text()
      for (const field of ['Contact:', 'Expires:', 'Canonical:', 'Preferred-Languages:', 'Policy:']) {
        if (!body.includes(field)) failures.push(`${route}: campo ausente ${field}`)
      }

      const expiresLine = body.split('\n').find((line) => line.startsWith('Expires:'))
      if (expiresLine) {
        const expiresAt = Date.parse(expiresLine.slice('Expires:'.length).trim())
        if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
          failures.push(`${route}: Expires inválido ou vencido`)
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido'
    failures.push(`${route}: ${message}`)
  }
}

try {
  const sw = await fetch(`${baseUrl}/sw.js`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
  })

  if (sw.status !== 200) failures.push(`/sw.js: HTTP ${sw.status}`)
  if (sw.headers.get('service-worker-allowed') !== '/') {
    failures.push('/sw.js: Service-Worker-Allowed deve ser /')
  }

  const cacheControl = sw.headers.get('cache-control') || ''
  if (!cacheControl.includes('no-cache') && !cacheControl.includes('no-store')) {
    failures.push('/sw.js: cache-control deve forçar revalidação do worker')
  }
} catch (error) {
  const message = error instanceof Error ? error.message : 'erro desconhecido'
  failures.push(`/sw.js: ${message}`)
}

if (failures.length) {
  console.error('Healthcheck de produção falhou:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(
    `Healthcheck de produção passou: ${routes.length} URLs, CSP estrita, headers, security.txt e service worker validados.`
  )
}
