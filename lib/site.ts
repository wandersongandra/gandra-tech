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
export const siteTitle = 'Desenvolvimento de Sites e Sistemas Web | Gandra Tech'
export const siteDescription =
  'Sites institucionais, sistemas sob medida e automações com design autoral e engenharia web. Transforme sua ideia em presença digital. Peça um orçamento.'
// Atualizar somente quando o conteúdo público ou seus metadados mudarem.
// Não usar a data do build: um deploy sem alteração editorial não é modificação.
export const siteLastModified = '2026-11-09'

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
