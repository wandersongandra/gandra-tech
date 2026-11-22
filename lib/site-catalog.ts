import { projects } from './projects.ts'
import { services } from './services.ts'

export const siteCatalog = {
  services: services.map(({ slug, title, shortDescription }) => ({ slug, title, shortDescription })),
  projects: projects.map(({ slug, name, category, year, overview }) => ({ slug, name, category, year, overview })),
}

export const commercialRoutes = [
  '/',
  '/servicos',
  ...siteCatalog.services.map((service) => `/servicos/${service.slug}`),
  '/trabalhos',
  ...siteCatalog.projects.map((project) => `/trabalhos/${project.slug}`),
  '/contato',
]

export const navigationRoutes = [
  ...commercialRoutes,
  '/termos-de-uso',
  '/politica-de-privacidade',
  '/politica-de-cookies',
]
