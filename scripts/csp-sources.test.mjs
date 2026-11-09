import assert from 'node:assert/strict'
import { hasCspSource, hasTurnstilePreload } from './csp-sources.mjs'

const trusted = 'https://challenges.cloudflare.com'
const safe = `default-src 'self'; script-src 'self' ${trusted}; connect-src 'self' ${trusted}; frame-src ${trusted}`
for (const directive of ['script-src', 'connect-src', 'frame-src']) {
  assert.equal(hasCspSource(safe, directive, trusted), true)
  for (const spoof of [
    `https://challenges.cloudflare.com.evil.example`,
    `https://evil.example/?next=${trusted}`,
    `https://evil.example/${trusted}`,
    'https://challenges.cloudflare.com:444',
  ]) {
    assert.equal(hasCspSource(`default-src 'self'; ${directive} 'self' ${spoof}`, directive, trusted), false, `fonte falsa não pode passar: ${spoof}`)
  }
}
assert.equal(hasCspSource(`script-src 'self' ${trusted}`, 'frame-src', trusted), false)
assert.equal(hasCspSource(`script-src-elem ${trusted}`, 'script-src', trusted), false)

const preload = (href) => `<link rel="preload" href="${href}" as="script"/>`
assert.equal(hasTurnstilePreload(preload(`${trusted}/turnstile/v0/api.js?render=explicit`)), true)
for (const url of [
  'https://challenges.cloudflare.com.evil.example/turnstile/v0/api.js?render=explicit',
  `https://evil.example/?redirect=${trusted}/turnstile/v0/api.js`,
  'https://challenges.cloudflare.com/turnstile/v0/other.js?render=explicit',
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=implicit',
]) {
  assert.equal(hasTurnstilePreload(preload(url)), false, `preload falso aceito: ${url}`)
}
assert.equal(hasTurnstilePreload(`<a href="${trusted}/turnstile/v0/api.js?render=explicit">link</a>`), false)

console.log('Validação CSP: fontes e preload exatos aceitos; URLs com domínio semelhante, prefixos ou sufixos rejeitadas.')
