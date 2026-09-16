import { isIP } from 'node:net'

const apiBase = 'https://api.cloudflare.com/client/v4'
const [command, value, ...flags] = process.argv.slice(2)
const confirmed = flags.includes('--confirm')
const zoneId = process.env.CF_ZONE_ID
const token = process.env.CF_API_TOKEN

function usage() {
  console.error('Uso:')
  console.error('  CF_ZONE_ID=... CF_API_TOKEN=... node scripts/cloudflare-emergency.mjs under-attack --confirm')
  console.error('  CF_ZONE_ID=... CF_API_TOKEN=... node scripts/cloudflare-emergency.mjs block-ip 203.0.113.10 --confirm')
}

if (!['under-attack', 'block-ip'].includes(command)) {
  usage()
  process.exitCode = 2
} else if (!confirmed) {
  console.error('Operação não executada: acrescente --confirm somente durante um incidente validado.')
  usage()
  process.exitCode = 2
} else if (!zoneId || !token) {
  console.error('Operação não executada: CF_ZONE_ID e CF_API_TOKEN são obrigatórios.')
  process.exitCode = 2
} else if (command === 'block-ip' && isIP(value) === 0) {
  console.error('Operação não executada: informe um IPv4 ou IPv6 válido.')
  process.exitCode = 2
} else {
  const endpoint = command === 'under-attack'
    ? `/zones/${zoneId}/settings/security_level`
    : `/zones/${zoneId}/firewall/access_rules/rules`
  const body = command === 'under-attack'
    ? { value: 'under_attack' }
    : {
        mode: 'block',
        configuration: { target: isIP(value) === 6 ? 'ip6' : 'ip', value },
        notes: 'Bloqueio emergencial aplicado após validação de incidente.',
      }

  try {
    const response = await fetch(`${apiBase}${endpoint}`, {
      method: command === 'under-attack' ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok || payload?.success !== true) {
      console.error(`Cloudflare API recusou a operação: HTTP ${response.status} em ${endpoint}`)
      process.exitCode = 1
    } else {
      console.log(`Cloudflare API confirmou a operação: HTTP ${response.status} em ${endpoint}`)
    }
  } catch (error) {
    console.error(`Falha de comunicação com a Cloudflare: ${error instanceof Error ? error.message : 'erro desconhecido'}`)
    process.exitCode = 1
  }
}
