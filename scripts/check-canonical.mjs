import path from 'node:path'
import { fileURLToPath } from 'node:url'

const canonicalOrigin = 'https://gandra.tech'
const cases = [
  'http://gandra.tech/servicos?origem=monitor',
  'https://www.gandra.tech/servicos?origem=monitor&campanha=seo',
  'http://www.gandra.tech/contato?origem=monitor',
]
const permanentRedirects = new Set([301, 308])

export async function checkCanonical(fetchImpl = fetch) {
  const failures = []

  for (const start of cases) {
    const original = new URL(start)
    const expected = `${canonicalOrigin}${original.pathname}${original.search}`
    const visited = new Set()
    let current = start
    let done = false

    for (let hop = 0; hop < 5; hop++) {
      if (visited.has(current)) {
        failures.push(`${start}: ciclo de redirecionamentos detectado`)
        done = true
        break
      }
      visited.add(current)

      try {
        const response = await fetchImpl(current, {
          redirect: 'manual',
          signal: AbortSignal.timeout(15_000),
        })
        if (permanentRedirects.has(response.status)) {
          const location = response.headers.get('location')
          if (!location) {
            failures.push(`${start}: redirecionamento sem Location`)
            done = true
            break
          }
          const destination = new URL(location, current)
          if (!['gandra.tech', 'www.gandra.tech'].includes(destination.hostname) ||
            !['http:', 'https:'].includes(destination.protocol) ||
            (current.startsWith('https:') && destination.protocol !== 'https:')) {
            failures.push(`${start}: destino inseguro ou externo`)
            done = true
            break
          }
          current = destination.href
          continue
        }

        if (response.status !== 200) {
          failures.push(`${start}: HTTP ${response.status} em ${current}`)
        } else if (visited.size === 1 || current !== expected) {
          failures.push(`${start}: destino final ${current} em vez de ${expected}`)
        }
        done = true
        break
      } catch (error) {
        failures.push(`${start}: ${error instanceof Error ? error.message : String(error)}`)
        done = true
        break
      }
    }

    if (!done) failures.push(`${start}: mais de quatro redirecionamentos`)
  }

  return failures
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = await checkCanonical()
  if (failures.length) {
    console.error('Canonical/HTTPS: falha de redirecionamento:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
  } else {
    console.log('Canonical/HTTPS validado: apex, www, HTTP e parâmetros preservados.')
  }
}
