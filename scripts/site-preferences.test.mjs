import assert from 'node:assert/strict'
import { localPreferenceKeys, sessionPreferenceKeys, removeSitePreferences } from '../lib/site-preferences.ts'

const local = new Map([...localPreferenceKeys.map((key) => [key, '1']), ['outro-servico', 'preservar']])
const session = new Map([...sessionPreferenceKeys.map((key) => [key, '1']), ['outro-servico', 'preservar']])

const asStorage = (map) => ({ removeItem: (key) => map.delete(key) })
assert.equal(removeSitePreferences(asStorage(local), asStorage(session)), true)
for (const key of localPreferenceKeys) assert.equal(local.has(key), false, `${key} local não foi apagado`)
for (const key of sessionPreferenceKeys) assert.equal(session.has(key), false, `${key} da sessão não foi apagado`)
assert.equal(local.get('outro-servico'), 'preservar', 'dado alheio removido do armazenamento local')
assert.equal(session.get('outro-servico'), 'preservar', 'dado alheio removido do armazenamento de sessão')

const attempted = []
const blockedLocal = {
  removeItem(key) {
    attempted.push(key)
    if (key === 'gt-som') throw new Error('armazenamento bloqueado')
  },
}
assert.equal(removeSitePreferences(blockedLocal, asStorage(session)), false, 'falha não pode ser relatada como sucesso')
assert.deepEqual(attempted, [...localPreferenceKeys], 'falha parcial não deve impedir tentativa das demais chaves')

console.log('Preferências: remoção restrita às chaves próprias, dados alheios preservados e falha parcial sinalizada.')
