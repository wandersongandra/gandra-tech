import assert from 'node:assert/strict'
import { isLeadAcceptedResponse, leadRejectionMessage } from '../lib/lead-response.ts'

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

const expectedErrors = [
  [503, 'temporarily_unavailable', 'não está disponível neste ambiente'],
  [403, 'forbidden_origin', 'não está autorizado'],
  [403, 'invalid_challenge', 'não foi aceita pelo servidor'],
  [503, 'challenge_unavailable', 'temporariamente indisponível'],
  [400, 'invalid_payload', 'não aceitou os dados'],
  [502, 'delivery_failed', 'não confirmou o recebimento'],
]
for (const [status, code, fragment] of expectedErrors) {
  const message = await leadRejectionMessage(json(status, { code }))
  assert.ok(message.includes(fragment), `${code} precisa orientar o usuário`)
  assert.ok(message.includes(`HTTP ${status}`), `${code} precisa permitir diagnóstico`)
}
assert.match(await leadRejectionMessage(new Response('Não encontrado', { status: 404 })), /HTTP 404/)
assert.match(await leadRejectionMessage(new Response('', { status: 429 })), /Aguarde/)
assert.doesNotMatch(
  await leadRejectionMessage(json(400, { code: 'unrecognized', detail: 'token-secreto' })),
  /token-secreto|unrecognized/,
)
assert.match(
  await leadRejectionMessage(new Response('<html>Fallback</html>', { status: 200, headers: { 'Content-Type': 'text/html' } })),
  /HTTP 200/,
)
console.log('Lead UI: falhas exibem apenas motivos conhecidos e status HTTP, sem dados sensíveis.')
