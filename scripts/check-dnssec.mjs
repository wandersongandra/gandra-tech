import path from 'node:path'
import { fileURLToPath } from 'node:url'

// O DS pode mudar em uma rotação legítima de chaves. Verificamos sua presença
// na delegação e exigimos respostas assinadas e validadas (AD=true), sem fixar
// o key tag/digest atual nem modificar a configuração da zona.
const endpoint = 'https://dns.google/resolve'
const checks = [
  { name: 'gandra.tech', type: 'DS', recordType: 43 },
  { name: 'gandra.tech', type: 'A', recordType: 1 },
  { name: 'gandra.tech', type: 'MX', recordType: 15 },
]

export async function checkDnssec(fetchImpl = fetch) {
  const failures = []

  for (const { name, type, recordType } of checks) {
    try {
      const url = new URL(endpoint)
      url.searchParams.set('name', name)
      url.searchParams.set('type', type)
      url.searchParams.set('do', '1')
      url.searchParams.set('cd', '0')

      const response = await fetchImpl(url.toString(), {
        headers: { Accept: 'application/dns-json' },
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) {
        failures.push(`DNSSEC ${type}: consulta HTTP ${response.status}`)
        continue
      }

      const result = await response.json()
      if (result?.Status !== 0) {
        failures.push(`DNSSEC ${type}: resposta DNS com Status=${result?.Status ?? 'ausente'}`)
        continue
      }

      const records = Array.isArray(result.Answer)
        ? result.Answer.filter((answer) => answer.type === recordType && typeof answer.data === 'string')
        : []
      if (type === 'DS' && !records.some((answer) => /^\d+\s+\d+\s+\d+\s+[a-f\d]{32,}$/i.test(answer.data.trim()))) {
        failures.push('DNSSEC DS: registro DS válido ausente na delegação')
      } else if (type !== 'DS' && records.length === 0) {
        failures.push(`DNSSEC ${type}: resposta sem registros esperados`)
      }

      if (result.AD !== true) {
        failures.push(`DNSSEC ${type}: resposta sem autenticação DNSSEC (AD não é true)`)
      }
    } catch (error) {
      failures.push(`DNSSEC ${type}: consulta indisponível (${error instanceof Error ? error.message : String(error)})`)
    }
  }

  return failures
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = await checkDnssec()
  if (failures.length) {
    console.error('Validação DNSSEC falhou:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
  } else {
    console.log('DNSSEC validado: DS publicado e respostas DS/A/MX com AD=true no Google Public DNS.')
  }
}
