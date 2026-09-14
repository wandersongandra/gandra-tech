/**
 * Dados globais do site: identidade, contato e redes.
 *
 * Redes sociais: preencha `url` para o link aparecer na seção Contato.
 * Entradas com `url` vazia são omitidas da renderização — melhor não
 * mostrar do que mostrar um link que não leva a lugar nenhum.
 */

export const siteName = 'Gandra Tech'
export const siteUrl = 'https://gandra.tech'
export const siteDescription = 'Interfaces, sistemas e experiências para o que vem a seguir.'

export const contactEmail = 'contato@gandra.tech'

/** Frases de princípio exibidas nas seções/página de contato. */
export const contactNotes = [
  'Movimento é matéria.',
  'Clareza é um recurso.',
  'Detalhes criam memória.',
]

export type SocialLink = {
  label: string
  /** Handle/nome exibido na página /contato (ex: "@gandratech"). */
  handle: string
  url: string
}

export const socialLinks: SocialLink[] = [
  { label: 'Instagram', handle: '@gandratech', url: '' },
  { label: 'LinkedIn', handle: 'Gandra Tech', url: '' },
  { label: 'GitHub', handle: 'gandratech', url: '' },
  { label: 'Behance', handle: 'gandratech', url: '' },
]

/** Só os que já têm URL definida. */
export const activeSocialLinks = socialLinks.filter((l) => l.url.trim() !== '')
