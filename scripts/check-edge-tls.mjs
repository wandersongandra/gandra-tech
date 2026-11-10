import tls from 'node:tls'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const hostname = 'gandra.tech'
const minimumRemainingMs = 14 * 24 * 60 * 60 * 1000

export function validateEdgeTls({ authorized, protocol, certificate }, now = Date.now()) {
  const failures = []
  if (authorized !== true) failures.push('TLS: certificado não autenticado')
  if (!['TLSv1.2', 'TLSv1.3'].includes(protocol)) failures.push(`TLS: protocolo negociado inválido (${protocol})`)

  const validUntil = Date.parse(certificate?.valid_to ?? '')
  if (!Number.isFinite(validUntil)) failures.push('TLS: validade do certificado indisponível')
  else if (validUntil <= now) failures.push('TLS: certificado vencido')
  else if (validUntil - now < minimumRemainingMs) failures.push('TLS: certificado vence em menos de 14 dias')
  return failures
}

export async function checkEdgeTls(connectImpl = tls.connect, now = Date.now()) {
  return new Promise((resolve) => {
    let settled = false
    let socket
    const finish = (failures) => {
      if (settled) return
      settled = true
      socket?.destroy()
      resolve(failures)
    }

    try {
      socket = connectImpl({
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      })
      socket.setTimeout(10_000)
      socket.once('secureConnect', () => finish(validateEdgeTls({
        authorized: socket.authorized,
        protocol: socket.getProtocol(),
        certificate: socket.getPeerCertificate(),
      }, now)))
      socket.once('error', (error) => finish([`TLS: conexão recusada (${error.message})`]))
      socket.once('timeout', () => finish(['TLS: timeout na negociação HTTPS']))
    } catch (error) {
      finish([`TLS: falha ao iniciar handshake (${error instanceof Error ? error.message : String(error)})`])
    }
  })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = await checkEdgeTls()
  if (failures.length) {
    console.error('TLS de borda: validação falhou:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
  } else {
    console.log('TLS de borda validado: HTTPS autenticado, TLS 1.2+ e certificado com 14+ dias de validade.')
  }
}
