import { services } from '@/lib/services'
import { getProject } from '@/lib/projects'
import { contactEmail } from '@/lib/site'

export type ContactBriefFields = {
  serviceSlug: string
  name: string
  contact: string
  project: string
  referenceSlug?: string
}

export function isKnownServiceSlug(slug: string): boolean {
  return services.some((service) => service.slug === slug)
}

export function isKnownReferenceSlug(slug: string): boolean {
  return Boolean(getProject(slug))
}

export function composeContactBrief(fields: ContactBriefFields) {
  const service = services.find((item) => item.slug === fields.serviceSlug)
  const reference = fields.referenceSlug ? getProject(fields.referenceSlug) : undefined
  const name = fields.name.trim()
  const contact = fields.contact.trim()
  const project = fields.project.trim()
  const subject = service
    ? `Pedido de orçamento: ${service.title} | Gandra Tech`
    : 'Pedido de orçamento | Gandra Tech'

  const body = [
    'Olá, equipe Gandra Tecnologia!',
    '',
    'Gostaria de conversar sobre um projeto e solicitar uma proposta.',
    `Serviço de interesse: ${service?.title ?? 'Ainda estou definindo'}`,
    reference ? `Case de referência: ${reference.name} (visto em gandra.tech/trabalhos/${reference.slug})` : null,
    name ? `Nome: ${name}` : null,
    contact ? `Contato para retorno: ${contact}` : null,
    '',
    'Sobre o projeto:',
    project || 'Podemos conversar sobre as possibilidades?',
  ]
    .filter((line): line is string => line !== null)
    .join('\n')

  return {
    subject,
    body,
    referenceName: reference?.name ?? null,
    copyText: `Para: ${contactEmail}\nAssunto: ${subject}\n\n${body}`,
    mailto: `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  }
}
