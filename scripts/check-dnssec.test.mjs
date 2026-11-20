import assert from 'node:assert/strict'
import { checkDnssec } from './check-dnssec.mjs'

const ds = '2371 13 2 ' + 'A1'.repeat(32)
const answers = {
  DS: { type: 43, data: ds },
  A: { type: 1, data: '192.0.2.1' },
  MX: { type: 15, data: '5 mx1.hostinger.com.' },
}

function mockResolver(overrides = {}) {
  return async (url, options) => {
    const query = new URL(url)
    const type = query.searchParams.get('type')
    assert.equal(query.hostname, 'dns.google')
    assert.equal(query.searchParams.get('do'), '1')
    assert.equal(query.searchParams.get('cd'), '0')
    assert.equal(options.headers.Accept, 'application/dns-json')
    if (overrides[type] instanceof Error) throw overrides[type]
    return {
      ok: true,
      status: 200,
      async json() { return overrides[type] ?? { Status: 0, AD: true, Answer: [answers[type]] } },
    }
  }
}

assert.deepEqual(await checkDnssec(mockResolver()), [], 'delegação e assinatura válidas devem passar')

const missingDs = await checkDnssec(mockResolver({ DS: { Status: 0, AD: true, Answer: [] } }))
assert.ok(missingDs.some((item) => item.includes('DS válido ausente')))

const unsigned = await checkDnssec(mockResolver({ A: { Status: 0, AD: false, Answer: [answers.A] } }))
assert.ok(unsigned.some((item) => item.includes('AD não é true')))

const bogus = await checkDnssec(mockResolver({ MX: { Status: 2, AD: false } }))
assert.ok(bogus.some((item) => item.includes('Status=2')))

const unavailable = await checkDnssec(mockResolver({ DS: new Error('network unavailable') }))
assert.ok(unavailable.some((item) => item.includes('consulta indisponível')))

console.log('DNSSEC monitor: validação positiva, DS ausente, resposta não assinada, SERVFAIL e rede indisponível testados.')
