import assert from 'node:assert/strict'
import { checkCanonical } from './check-canonical.mjs'

function response(status, location) {
  return { status, headers: { get(name) { return name === 'location' ? location ?? null : null } } }
}

const goodFetch = async (address, options) => {
  assert.equal(options.redirect, 'manual')
  const url = new URL(address)
  if (url.protocol === 'http:') return response(301, `https://${url.hostname}${url.pathname}${url.search}`)
  if (url.hostname === 'www.gandra.tech') return response(301, `https://gandra.tech${url.pathname}${url.search}`)
  return response(200)
}

assert.deepEqual(await checkCanonical(goodFetch), [], 'HTTPS e canonical válidos devem passar')

const temporary = await checkCanonical(async (address, opts) => {
  if (address.startsWith('https://www.')) return response(302, 'https://gandra.tech/servicos')
  return goodFetch(address, opts)
})
assert.ok(temporary.some((msg) => msg.includes('HTTP 302')))

const droppedQuery = await checkCanonical(async (address, opts) => {
  if (address.startsWith('https://www.')) return response(301, 'https://gandra.tech/servicos')
  return goodFetch(address, opts)
})
assert.ok(droppedQuery.some((msg) => msg.includes('destino final')))

const external = await checkCanonical(async (address, opts) => {
  if (address.startsWith('https://www.')) return response(301, 'https://example.invalid/servicos')
  return goodFetch(address, opts)
})
assert.ok(external.some((msg) => msg.includes('destino inseguro ou externo')))

const loop = await checkCanonical(async (address, opts) => {
  if (address.startsWith('https://www.')) return response(301, address)
  return goodFetch(address, opts)
})
assert.ok(loop.some((msg) => msg.includes('ciclo')))

console.log('Canonical monitor: redirects válidos, temporários, perda de parâmetros, destino externo e loop testados.')
