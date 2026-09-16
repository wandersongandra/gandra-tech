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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido'
    failures.push(`${route}: ${message}`)
  }
}

if (failures.length) {
  console.error('Healthcheck de produção falhou:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Healthcheck de produção passou: ${routes.length} URLs responderam 200 com headers de segurança.`)
}
