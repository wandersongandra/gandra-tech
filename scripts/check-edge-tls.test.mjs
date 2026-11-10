import assert from 'node:assert/strict'
import { validateEdgeTls } from './check-edge-tls.mjs'

const now = Date.parse('2026-11-10T12:00:00.000Z')
const certificate = { valid_to: new Date(now + 30 * 24 * 60 * 60 * 1000).toUTCString() }

assert.deepEqual(validateEdgeTls({ authorized: true, protocol: 'TLSv1.3', certificate }, now), [])
assert.deepEqual(validateEdgeTls({ authorized: true, protocol: 'TLSv1.2', certificate }, now), [])
assert.ok(validateEdgeTls({ authorized: false, protocol: 'TLSv1.3', certificate }, now).some((v) => v.includes('não autenticado')))
assert.ok(validateEdgeTls({ authorized: true, protocol: 'TLSv1.1', certificate }, now).some((v) => v.includes('protocolo')))
assert.ok(validateEdgeTls({ authorized: true, protocol: 'TLSv1.3', certificate: {} }, now).some((v) => v.includes('indisponível')))
assert.ok(validateEdgeTls({ authorized: true, protocol: 'TLSv1.3', certificate: { valid_to: new Date(now - 1000).toUTCString() } }, now).some((v) => v.includes('vencido')))
assert.ok(validateEdgeTls({ authorized: true, protocol: 'TLSv1.3', certificate: { valid_to: new Date(now + 3 * 24 * 60 * 60 * 1000).toUTCString() } }, now).some((v) => v.includes('menos de 14 dias')))

console.log('TLS monitor: cadeia autenticada, protocolos, certificado vencido/iminente e ausência de data testados.')
