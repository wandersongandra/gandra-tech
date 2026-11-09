import dns from 'node:dns/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Contrato do DNS de produção conferido no painel da Cloudflare em 09/11/2026.
// Mudanças de provedor de e-mail exigem atualizar este contrato no mesmo PR.
// CNAMEs de e-mail precisam continuar DNS-only (e não ser achatados pelo proxy).
const cnameTargets = new Map([
  ['autoconfig.gandra.tech', 'autoconfig.mail.hostinger.com'],
  ['autodiscover.gandra.tech', 'autodiscover.mail.hostinger.com'],
  ['hostingermail-a._domainkey.gandra.tech', 'hostingermail-a.dkim.mail.hostinger.com'],
  ['hostingermail-b._domainkey.gandra.tech', 'hostingermail-b.dkim.mail.hostinger.com'],
  ['hostingermail-c._domainkey.gandra.tech', 'hostingermail-c.dkim.mail.hostinger.com'],
  ['send.envios.gandra.tech', 'send.forge.rmta.net'],
  ['rsend.envios.gandra.tech', 'rsend-sae1.forge.rmta.net'],
])
const mxTargets = [
  { exchange: 'mx1.hostinger.com', priority: 5 },
  { exchange: 'mx2.hostinger.com', priority: 10 },
]

const normalize = (value) => value.toLowerCase().replace(/\.$/, '')

export async function checkDns(resolver) {
  const failures = []
  for (const [name, target] of cnameTargets) {
    try {
      const answers = (await resolver.resolveCname(name)).map(normalize)
      if (answers.length !== 1 || answers[0] !== target) {
        failures.push(`${name}: CNAME ${JSON.stringify(answers)} em vez de ${target}`)
      }
    } catch (error) {
      failures.push(`${name}: não resolve CNAME (${error?.code || String(error)}) — verificar se está DNS-only`)
    }
  }

  try {
    const answers = await resolver.resolveMx('gandra.tech')
    for (const { exchange, priority } of mxTargets) {
      if (!answers.some((answer) => normalize(answer.exchange) === exchange && answer.priority === priority)) {
        failures.push(`gandra.tech: MX ${exchange} prioridade ${priority} ausente`)
      }
    }
  } catch (error) {
    failures.push(`gandra.tech: MX indisponível (${error?.code || String(error)})`)
  }

  try {
    const answers = (await resolver.resolveTxt('gandra.tech')).map((chunks) => chunks.join(''))
    const spf = answers.filter((txt) => /^v=spf1(?:\s|$)/i.test(txt))
    if (spf.length !== 1) failures.push(`gandra.tech: esperado exatamente um SPF, encontrados ${spf.length}`)
    else if (!spf[0].includes('include:_spf.mail.hostinger.com') || !spf[0].includes('include:_spf.reach.hostinger.com')) {
      failures.push('gandra.tech: SPF não contém os envios legítimos da Hostinger')
    }
  } catch (error) {
    failures.push(`gandra.tech: SPF indisponível (${error?.code || String(error)})`)
  }

  try {
    const answers = (await resolver.resolveTxt('_dmarc.gandra.tech')).map((chunks) => chunks.join(''))
    const policies = answers.filter((txt) => /^v=DMARC1(?:;|\s|$)/i.test(txt))
    if (policies.length !== 1) failures.push(`_dmarc.gandra.tech: esperado um DMARC, encontrados ${policies.length}`)
    else if (!/(?:^|;)\s*p\s*=\s*(none|quarantine|reject)(?:\s*;|\s*$)/i.test(policies[0])) {
      failures.push('_dmarc.gandra.tech: política p= inválida ou ausente')
    }
  } catch (error) {
    failures.push(`_dmarc.gandra.tech: DMARC indisponível (${error?.code || String(error)})`)
  }

  try {
    const answers = (await resolver.resolveTxt('resend._domainkey.envios.gandra.tech')).map((chunks) => chunks.join(''))
    if (!answers.some((txt) => /(?:^|;)\s*p=[A-Za-z0-9+/]{50,}={0,2}(?:;|$)/.test(txt))) {
      failures.push('resend._domainkey.envios.gandra.tech: chave pública DKIM ausente ou inválida')
    }
  } catch (error) {
    failures.push(`resend._domainkey.envios.gandra.tech: DKIM indisponível (${error?.code || String(error)})`)
  }

  return failures
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = await checkDns(dns)
  if (failures.length) {
    console.error('DNS de produção falhou:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
  } else {
    console.log(`DNS de produção validado: ${cnameTargets.size} CNAMEs, MX Hostinger, SPF, DMARC e DKIM Resend.`)
    console.log('Observação: DMARC em p=none e DNSSEC dependem de validação operacional separada.')
  }
}
