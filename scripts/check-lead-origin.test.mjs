import assert from 'node:assert/strict'
import { checkLeadOriginBarrier } from './check-lead-origin.mjs'

const calls = []
const response = (status, code, headers = {}) => new Response(JSON.stringify({ code }), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  },
})

const allowed = await checkLeadOriginBarrier(async (url, options) => {
  calls.push({ url, options })
  return response(403, 'forbidden_origin')
})
assert.deepEqual(allowed, [])
assert.equal(calls.length, 2)
assert.equal(calls[0].url, 'https://gandra.tech/api/lead')
assert.equal(calls[0].options.headers.Origin, 'https://origem-nao-autorizada.invalid')
assert.equal(calls[1].url, 'https://gandra-tech.pages.dev/api/lead')
assert.equal(calls[1].options.headers.Origin, 'https://gandra.tech')
for (const { options } of calls) {
  assert.equal(options.method, 'POST')
  assert.equal(options.body, '{}', 'canary jamais envia dados de interessados')
  assert.equal(options.redirect, 'manual')
}

assert.deepEqual(await checkLeadOriginBarrier(async () => response(503, 'temporarily_unavailable')), [])

const bypass = await checkLeadOriginBarrier(async (url) =>
  url.includes('pages.dev') ? response(202, 'accepted') : response(403, 'forbidden_origin'))
assert.ok(bypass.some((error) => error.includes('pages.dev') && error.includes('HTTP 202')))

const htmlFallback = await checkLeadOriginBarrier(async () => new Response('<html>erro</html>', {
  status: 200,
  headers: { 'Content-Type': 'text/html' },
}))
assert.ok(htmlFallback.some((error) => error.includes('não é JSON')))
assert.ok(htmlFallback.some((error) => error.includes('no-store')))
assert.ok(htmlFallback.some((error) => error.includes('nosniff')))

const ambiguous = await checkLeadOriginBarrier(async () => response(403, 'accepted'))
assert.ok(ambiguous.some((error) => error.includes('não confirmou bloqueio')))

const outage = await checkLeadOriginBarrier(async () => { throw new Error('rede indisponível') })
assert.equal(outage.length, 2)
assert.ok(outage.every((error) => error.includes('rede indisponível')))

console.log('Canary de origem: bloqueio no domínio oficial e no pages.dev, bypass, HTML e indisponibilidade testados.')
