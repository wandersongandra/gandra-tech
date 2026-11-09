import assert from 'node:assert/strict'
import { isValidLeadContact } from '../lib/lead-contact-validation.ts'

for (const valid of ['cliente@example.com', ' contato@empresa.com.br ', '(31) 99999-9999', '+55 (31) 99999-9999', '31999999999']) {
  assert.equal(isValidLeadContact(valid), true, `contato válido rejeitado: ${valid}`)
}

for (const invalid of ['cliente@exemplo', 'cliente@@example.com', 'nome qualquer', '(31) 9999-999', '123456789', 'nome\r\nBcc: outro@example.com', 'a'.repeat(121)]) {
  assert.equal(isValidLeadContact(invalid), false, `contato inválido aceito: ${invalid}`)
}

console.log('Validação de contatos: e-mails e telefones formatados aceitos; entradas inválidas rejeitadas.')
