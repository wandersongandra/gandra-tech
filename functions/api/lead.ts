/**
 * Cloudflare Pages Function: POST /api/lead
 *
 * Não grava currículos, contatos nem mensagens em banco. Exige Turnstile e
 * credenciais do Resend antes de aceitar um pedido.
 * O envio usa somente o destinatário fixo da Gandra Tecnologia.
 */

type LeadEnv = {
  LEADS_ALLOWED_ORIGIN?: string
  LEADS_FROM_EMAIL?: string
  RESEND_API_KEY?: string
  TURNSTILE_SECRET_KEY?: string
}

type LeadContext = { request: Request; env: LeadEnv }

const DESTINATION = 'contato@gandra.tech'
const BODY_LIMIT = 4096
const ALLOWED_SERVICES = new Map([
  ['sites-institucionais', 'Sites institucionais'],
  ['portfolios-profissionais', 'Portfólios profissionais'],
  ['sistemas-sob-medida', 'Sistemas sob medida'],
  ['aplicacoes-web', 'Aplicações web'],
  ['automacao-de-processos-e-integracoes', 'Automação de processos e integrações'],
])
const ALLOWED_REFERENCES = new Map([
  ['sgs', 'SGS Segurança'],
  ['telma-santos', 'Portfólio Telma Santos'],
  ['gisley-nunes-imoveis', 'Gisley Nunes Imóveis'],
  ['ajn-consultoria-engenharia', 'AJN Consultoria e Engenharia'],
  ['laboratorio-dental-araujo', 'Laboratório Dental Araújo'],
])

function json(status: number, code: string) {
  return new Response(JSON.stringify({ code }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

async function readLimitedJson(request: Request): Promise<unknown | null> {
  if (Number(request.headers.get('content-length') ?? 0) > BODY_LIMIT) return null
  const reader = request.body?.getReader()
  if (!reader) return null
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > BODY_LIMIT) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown
  } catch {
    return null
  }
}

type LeadPayload = {
  name: string
  contact: string
  project: string
  serviceSlug: string
  referenceSlug: string
  token: string
}

function parseLead(input: unknown): LeadPayload | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const obj = input as Record<string, unknown>
  if (obj.website !== '' || obj.consent !== true) return null
  const { name, contact, project, serviceSlug, token } = obj
  if ([name, contact, project, serviceSlug, token].some((item) => typeof item !== 'string')) return null
  if (obj.referenceSlug !== undefined && typeof obj.referenceSlug !== 'string') return null

  const result = {
    name: (name as string).trim(),
    contact: (contact as string).trim(),
    project: (project as string).trim(),
    serviceSlug: (serviceSlug as string).trim(),
    referenceSlug: (obj.referenceSlug as string | undefined)?.trim() ?? '',
    token: (token as string).trim(),
  }

  if (result.name.length < 2 || result.name.length > 90 || /[\r\n\0]/.test(result.name)) return null
  if (result.contact.length < 7 || result.contact.length > 120 || /[\r\n\0]/.test(result.contact)) return null
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.contact)
  const digitCount = result.contact.replace(/\D/g, '').length
  if (!validEmail && (digitCount < 10 || digitCount > 15)) return null
  if (result.project.length < 15 || result.project.length > 600 || /\0/.test(result.project)) return null
  if (result.serviceSlug && !ALLOWED_SERVICES.has(result.serviceSlug)) return null
  if (result.referenceSlug && !ALLOWED_REFERENCES.has(result.referenceSlug)) return null
  if (!result.token || result.token.length > 2048) return null

  return result
}

function configured(env: LeadEnv) {
  return Boolean(
    env.TURNSTILE_SECRET_KEY &&
    /^re_[\w-]{8,}$/.test(env.RESEND_API_KEY ?? '') &&
    /^[^@\s]+@(?:[a-z\d-]+\.)*gandra\.tech$/i.test(env.LEADS_FROM_EMAIL ?? ''),
  )
}

async function validateTurnstile(token: string, env: LeadEnv, origin: string, request: Request) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: request.headers.get('CF-Connecting-IP') ?? undefined,
    }),
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) return false
  const proof = (await response.json()) as { success?: boolean; hostname?: string; action?: string }
  return proof.success === true &&
    proof.hostname === new URL(origin).hostname &&
    proof.action === 'gandra-lead'
}

async function sendLead(payload: LeadPayload, env: LeadEnv) {
  const service = ALLOWED_SERVICES.get(payload.serviceSlug) ?? 'A definir'
  const reference = ALLOWED_REFERENCES.get(payload.referenceSlug)
  // O remetente é um subdomínio verificado da Gandra. Respostas ao e-mail
  // comercial são direcionadas ao interessado, sem falsificar o remetente.
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact) ? payload.contact : null
  const text = [
    'Novo pedido de orçamento recebido no gandra.tech.',
    '',
    `Nome: ${payload.name}`,
    `Contato para retorno: ${payload.contact}`,
    `Serviço: ${service}`,
    ...(reference ? [`Case de referência: ${reference} (gandra.tech/trabalhos/${payload.referenceSlug})`] : []),
    '',
    'Resumo do projeto:',
    payload.project,
  ].join('\n')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.LEADS_FROM_EMAIL,
      to: [DESTINATION],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: `Novo orçamento no site: ${service}`,
      text,
    }),
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) return false
  const result = (await response.json()) as { id?: unknown }
  // O ID confirma apenas que o Resend aceitou a mensagem na fila, não que
  // o destinatário já a recebeu. Bounces precisam de verificação operacional.
  return typeof result.id === 'string' &&
    /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(result.id)
}

export async function onRequestPost({ request, env }: LeadContext): Promise<Response> {
  // Mesmo que a Function seja publicada antes do painel estar configurado,
  // nunca aceita pedidos silenciosamente nem expõe segredos ao frontend.
  if (!configured(env)) return json(503, 'temporarily_unavailable')
  const origin = env.LEADS_ALLOWED_ORIGIN || 'https://gandra.tech'
  if (request.headers.get('origin') !== origin) return json(403, 'forbidden_origin')
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json(415, 'unsupported_media_type')
  }

  const payload = parseLead(await readLimitedJson(request))
  if (!payload) return json(400, 'invalid_payload')

  try {
    if (!(await validateTurnstile(payload.token, env, origin, request))) {
      return json(403, 'invalid_challenge')
    }
  } catch {
    return json(503, 'challenge_unavailable')
  }

  try {
    if (!(await sendLead(payload, env))) return json(502, 'delivery_failed')
    return json(202, 'accepted')
  } catch {
    return json(502, 'delivery_failed')
  }
}
