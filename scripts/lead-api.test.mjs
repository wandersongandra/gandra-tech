import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/lead.ts'

const previousFetch = globalThis.fetch
const env = {
  LEADS_API_ENABLED: '1',
  LEADS_ALLOWED_ORIGIN: 'https://gandra.tech',
  LEADS_FROM_EMAIL: 'orcamentos@envios.gandra.tech',
  RESEND_API_KEY: 're_test-only-token',
  TURNSTILE_SECRET_KEY: 'test-only-secret',
}
const valid = {
  name: 'Cliente de teste',
  contact: 'cliente@example.com',
  project: 'Preciso de um site institucional para apresentar minha empresa.',
  serviceSlug: 'sites-institucionais',
  referenceSlug: 'laboratorio-dental-araujo',
  token: 'one-time-token',
  website: '',
  consent: true,
}

function request(payload = valid, headers = {}) {
  return new Request('https://gandra.tech/api/lead', {
    method: 'POST',
    headers: { Origin: 'https://gandra.tech', 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload),
  })
}

const calls = []
let challenge = { success: true, hostname: 'gandra.tech', action: 'gandra-lead' }
const acceptedId = '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794'
let delivery = { id: acceptedId }
let deliveryStatus = 200

globalThis.fetch = async (url, init) => {
  calls.push({ url: String(url), init })
  if (String(url).includes('/siteverify')) {
    return new Response(JSON.stringify(challenge), { status: 200 })
  }
  if (String(url) === 'https://api.resend.com/emails') {
    return new Response(JSON.stringify(delivery), { status: deliveryStatus })
  }
  throw new Error('Unexpected external request: ' + url)
}

async function expectStatus(payload, status, options = {}) {
  const response = await onRequestPost({ request: request(payload, options.headers), env: options.env || env })
  assert.equal(response.status, status)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
  return response.json()
}

try {
  // Sem os bindings obrigatórios a rota permanece fechada e não chama provedores.
  calls.length = 0
  assert.equal((await expectStatus(valid, 503, { env: {} })).code, 'temporarily_unavailable')
  assert.equal(calls.length, 0)

  // A presença de segredos não autoriza tráfego: produção exige liberação
  // explícita no servidor, independentemente da flag pública do frontend.
  for (const disabled of [undefined, '', '0', 'true']) {
    calls.length = 0
    const blockedEnv = { ...env, LEADS_API_ENABLED: disabled }
    assert.equal((await expectStatus(valid, 503, { env: blockedEnv })).code, 'temporarily_unavailable')
    assert.equal(calls.length, 0, 'API desativada não deve consultar Turnstile ou Resend')
  }

  calls.length = 0
  assert.equal((await expectStatus(valid, 403, { headers: { Origin: 'https://exemplo.com' } })).code, 'forbidden_origin')
  assert.equal(calls.length, 0)

  for (const bad of [
    { ...valid, website: 'robô' },
    { ...valid, consent: false },
    { ...valid, serviceSlug: '../api' },
    { ...valid, referenceSlug: '../admin' },
    { ...valid, referenceSlug: { slug: 'sgs' } },
    { ...valid, name: 'A' },
    { ...valid, name: 'Nome\r\nBcc: vítima' },
    { ...valid, contact: 'invalido' },
    { ...valid, project: 'curto' },
    { ...valid, token: '' },
    { ...valid, project: 'X'.repeat(5000) },
  ]) {
    calls.length = 0
    assert.equal((await expectStatus(bad, 400)).code, 'invalid_payload')
    assert.equal(calls.length, 0, 'dados inválidos não podem consumir serviços externos')
  }

  challenge = { success: false, hostname: 'gandra.tech', action: 'gandra-lead' }
  assert.equal((await expectStatus(valid, 403)).code, 'invalid_challenge')
  challenge = { success: true, hostname: 'evil.example', action: 'gandra-lead' }
  assert.equal((await expectStatus(valid, 403)).code, 'invalid_challenge')
  challenge = { success: true, hostname: 'gandra.tech', action: 'outra-acao' }
  assert.equal((await expectStatus(valid, 403)).code, 'invalid_challenge')

  challenge = { success: true, hostname: 'gandra.tech', action: 'gandra-lead' }
  delivery = { error: 'provider_failed' }
  assert.equal((await expectStatus(valid, 502)).code, 'delivery_failed')
  delivery = { id: '' }
  assert.equal((await expectStatus(valid, 502)).code, 'delivery_failed')
  delivery = { id: 'not-a-real-id' }
  assert.equal((await expectStatus(valid, 502)).code, 'delivery_failed')
  delivery = { id: acceptedId }
  deliveryStatus = 422
  assert.equal((await expectStatus(valid, 502)).code, 'delivery_failed')
  deliveryStatus = 200

  delivery = { id: acceptedId }
  calls.length = 0
  const result = await expectStatus(valid, 202)
  assert.deepEqual(result, { code: 'accepted' })
  assert.equal(calls.length, 2, 'precisa verificar Turnstile antes do envio')
  assert.match(calls[0].url, /turnstile\/v0\/siteverify$/)
  assert.equal(calls[1].url, 'https://api.resend.com/emails')
  assert.equal(calls[1].init.headers.Authorization, 'Bearer re_test-only-token')
  const send = JSON.parse(calls[1].init.body)
  assert.equal(send.from, 'orcamentos@envios.gandra.tech')
  assert.deepEqual(send.to, ['contato@gandra.tech'])
  assert.equal(send.reply_to, 'cliente@example.com', 'retorno ao cliente deve usar Reply-To, sem falsificar o remetente')
  assert.match(send.subject, /Sites institucionais/)
  assert.match(send.text, /Cliente de teste/)
  assert.match(send.text, /cliente@example.com/)
  assert.match(send.text, /Case de referência: Laboratório Dental Araújo/)
  assert.match(send.text, /\nCase de referência:/)
  assert.ok(!JSON.stringify(result).includes('cliente@example.com'), 'resposta não pode vazar dados')

  calls.length = 0
  assert.equal((await expectStatus({ ...valid, contact: '(31) 99999-9999' }, 202)).code, 'accepted')
  assert.ok(!Object.hasOwn(JSON.parse(calls[1].init.body), 'reply_to'), 'telefone não é endereço de resposta')

  calls.length = 0
  assert.equal((await expectStatus({ ...valid, referenceSlug: '' }, 202)).code, 'accepted')
  assert.doesNotMatch(JSON.parse(calls[1].init.body).text, /Case de referência/)

  calls.length = 0
  const { referenceSlug: ignoredReference, ...legacyPayload } = valid
  assert.equal((await expectStatus(legacyPayload, 202)).code, 'accepted')
  assert.doesNotMatch(JSON.parse(calls[1].init.body).text, /Case de referência/)

  // Remetente verificado em subdomínio dedicado não altera o recebimento.
  calls.length = 0
  await expectStatus(valid, 202, { env: { ...env, LEADS_FROM_EMAIL: 'comercial@envios.gandra.tech' } })
  assert.equal(JSON.parse(calls[1].init.body).from, 'comercial@envios.gandra.tech')

  calls.length = 0
  assert.equal((await expectStatus(valid, 503, { env: { ...env, RESEND_API_KEY: '' } })).code, 'temporarily_unavailable')
  assert.equal(calls.length, 0, 'sem token não pode encaminhar pedidos')

  globalThis.fetch = async () => { throw new Error('provedor indisponível') }
  assert.equal((await expectStatus(valid, 503)).code, 'challenge_unavailable')

  console.log('Lead API: testes unitários de configuração, entrada, origem, antispam e entrega simulada passaram.')
} finally {
  globalThis.fetch = previousFetch
}
