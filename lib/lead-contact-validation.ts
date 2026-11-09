/** Mesma regra de contato aceita pelo endpoint de leads. */
export function isValidLeadContact(value: string): boolean {
  const contact = value.trim()
  if (contact.length < 7 || contact.length > 120 || /[\r\n\0]/.test(contact)) return false

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
  const phoneDigits = contact.replace(/\D/g, '').length
  return isEmail || (phoneDigits >= 10 && phoneDigits <= 15)
}
