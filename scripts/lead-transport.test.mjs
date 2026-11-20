import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const contact = readFileSync(new URL('../components/sections/ContactBrief.tsx', import.meta.url), 'utf8')
const submit = contact.match(/fetch\('\/api\/lead',\s*\{([\s\S]*?)\n\s*\}\)/)

assert.ok(submit, 'O envio deve permanecer em /api/lead (mesma origem).')
assert.match(submit[1], /credentials:\s*'same-origin'/, 'A prévia protegida pelo Cloudflare Access precisa receber seu cookie de sessão.')
assert.doesNotMatch(submit[1], /credentials:\s*'include'/, 'Não permitir credenciais para origens externas.')
assert.match(submit[1], /method:\s*'POST'/)

console.log('Lead transport: POST same-origin inclui apenas cookies da própria origem para Cloudflare Access.')
