import assert from 'node:assert/strict'
import { checkDns } from './check-dns.mjs'

const cnames = new Map([
  ['autoconfig.gandra.tech', 'autoconfig.mail.hostinger.com.'],
  ['autodiscover.gandra.tech', 'autodiscover.mail.hostinger.com'],
  ['hostingermail-a._domainkey.gandra.tech', 'hostingermail-a.dkim.mail.hostinger.com'],
  ['hostingermail-b._domainkey.gandra.tech', 'hostingermail-b.dkim.mail.hostinger.com'],
  ['hostingermail-c._domainkey.gandra.tech', 'hostingermail-c.dkim.mail.hostinger.com'],
  ['send.envios.gandra.tech', 'send.forge.rmta.net'],
  ['rsend.envios.gandra.tech', 'rsend-sae1.forge.rmta.net'],
])
const resolver = {
  async resolveCname(name) { return [cnames.get(name)] },
  async resolveMx() { return [
    { exchange: 'mx1.hostinger.com.', priority: 5 },
    { exchange: 'mx2.hostinger.com', priority: 10 },
  ] },
  async resolveTxt(name) {
    if (name === 'gandra.tech') return [['v=spf1 include:_spf.mail.hostinger.com ', 'include:_spf.reach.hostinger.com ~all']]
    if (name === 'resend._domainkey.envios.gandra.tech') return [['p=', 'A'.repeat(80)]]
    return [['v=DMARC1; p=none']]
  },
}

assert.deepEqual(await checkDns(resolver), [], 'registros esperados precisam passar')

const faultyCname = { ...resolver, async resolveCname(name) {
  if (name.startsWith('hostingermail-a')) throw Object.assign(new Error('proxied'), { code: 'ENODATA' })
  return resolver.resolveCname(name)
} }
assert.ok((await checkDns(faultyCname)).some((msg) => msg.includes('hostingermail-a') && msg.includes('DNS-only')))

const faultyTxt = { ...resolver, async resolveTxt(name) {
  if (name === 'gandra.tech') return [['v=spf1 -all'], ['v=spf1 ~all']]
  return [['v=DMARC1; p=invalid']]
} }
const errors = await checkDns(faultyTxt)
assert.ok(errors.some((msg) => msg.includes('exatamente um SPF')))
assert.ok(errors.some((msg) => msg.includes('política p=')))

console.log('DNS monitor: contratos e falhas de CNAME proxied, SPF duplicado e DMARC inválido testados.')
