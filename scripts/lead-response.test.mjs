import assert from 'node:assert/strict'
import { isLeadAcceptedResponse } from '../lib/lead-response.ts'

const json = (status, body, contentType = 'application/json; charset=utf-8') =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } })

assert.equal(await isLeadAcceptedResponse(json(202, { code: 'accepted' })), true)

for (const response of [
  new Response('<html>Fallback estático</html>', { status: 200, headers: { 'Content-Type': 'text/html' } }),
  json(200, { code: 'accepted' }),
  json(201, { code: 'accepted' }),
  json(202, { code: 'temporarily_unavailable' }),
  json(202, { ok: true }),
  json(202, null),
  json(202, ['accepted']),
  json(202, { code: 'accepted' }, 'text/html'),
  new Response('não é JSON', { status: 202, headers: { 'Content-Type': 'application/json' } }),
  new Response(null, { status: 204 }),
]) {
  assert.equal(await isLeadAcceptedResponse(response), false, 'resposta não confirmada não pode mostrar sucesso')
}

console.log('Lead UI: aceita apenas HTTP 202 + JSON {code: accepted}; rejeita fallbacks HTML e respostas ambíguas.')
