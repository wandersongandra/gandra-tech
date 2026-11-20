// Canary de segurança não destrutiva: corpo vazio e nenhuma credencial de
// Turnstile. Nunca envia um orçamento nem consome a API do provedor de e-mail.
// O hostname pages.dev não herda o WAF da zona gandra.tech; por isso testamos
// também um Origin falsificado aparentemente legítimo nesse hostname.
const originCases = [
  {
    label: 'gandra.tech/api/lead: Origin externo',
    url: 'https://gandra.tech/api/lead',
    origin: 'https://origem-nao-autorizada.invalid',
  },
  {
    label: 'gandra-tech.pages.dev/api/lead: Origin falsificado',
    url: 'https://gandra-tech.pages.dev/api/lead',
    origin: 'https://gandra.tech',
  },
]

export async function checkLeadOriginBarrier(fetchImpl = fetch) {
  const failures = []
  for (const { label, url, origin } of originCases) {
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        redirect: 'manual',
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(15_000),
      })
      const expected = new Map([[403, 'forbidden_origin'], [503, 'temporarily_unavailable']])
      if (!expected.has(response.status)) {
        failures.push(`${label}: bloqueio retornou HTTP ${response.status}`)
      }
      if (!(response.headers.get('content-type') || '').startsWith('application/json')) {
        failures.push(`${label}: resposta da Function não é JSON`)
      } else {
        const body = await response.json().catch(() => null)
        if (body?.code !== expected.get(response.status)) {
          failures.push(`${label}: resposta não confirmou bloqueio seguro da origem`)
        }
      }
      if (response.headers.get('cache-control') !== 'no-store') {
        failures.push(`${label}: resposta sensível sem Cache-Control: no-store`)
      }
      if (response.headers.get('x-content-type-options') !== 'nosniff') {
        failures.push(`${label}: resposta sem X-Content-Type-Options: nosniff`)
      }
    } catch (error) {
      failures.push(`${label}: ${error instanceof Error ? error.message : 'erro desconhecido'}`)
    }
  }
  return failures
}
