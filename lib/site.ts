/**
 * Dados globais do site: identidade, contato e redes.
 *
 * Redes sociais: preencha `url` para o link aparecer na seção Contato.
 * Entradas com `url` vazia são omitidas da renderização — melhor não
 * mostrar do que mostrar um link que não leva a lugar nenhum.
 */

export const siteName = 'Gandra Tecnologia'
export const brandName = 'Gandra Tech'
export const siteUrl = 'https://gandra.tech'
export const siteDescription =
  'Desenvolvimento de sites institucionais, portfólios profissionais, sistemas sob medida, automações e aplicações web para empresas e profissionais em todo o Brasil.'
export const siteLastModified = '2026-09-14'

export const contactEmail = 'contato@gandra.tech'
export const contactSubject = 'Novo projeto - Gandra Tecnologia'
export const contactMailto = `mailto:${contactEmail}?subject=${encodeURIComponent(contactSubject)}`

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
