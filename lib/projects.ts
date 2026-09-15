export type Project = {
  slug: string
  name: string
  category: string
  year: string
  headline: string
  overview: string
  services: string[]
  workImage: string
  coverImage: string
  mainImage: string
}

export const projects: Project[] = [
  {
    slug: 'sgs',
    name: 'SGS Segurança',
    category: 'Plataforma digital',
    year: '2026',
    headline: 'Segurança industrial centralizada em uma única tela.',
    overview:
      'Uma plataforma completa para empresas que precisam centralizar inspeções, APRs, permissões de trabalho, auditorias, indicadores, documentos e evidências. Desenvolvida para aumentar a produtividade, garantir conformidade e reduzir riscos operacionais.',
    services: ['Produto', 'UX / UI', 'Engenharia web', 'Mobile'],
    workImage: '/images/work/sgs.webp',
    coverImage: '/images/projects/sgs/cover.webp',
    mainImage: '/images/projects/sgs/main.webp',
  },
  {
    slug: 'telma-santos',
    name: 'Portfólio Telma Santos',
    category: 'Portfólio profissional',
    year: 'Atual',
    headline: 'Uma presença digital clara para apresentar trabalho e serviços.',
    overview:
      'Projeto de portfólio desenvolvido para apresentar trabalho, identidade visual e serviços.',
    services: ['Estratégia visual', 'Design de interface', 'Engenharia web'],
    workImage: '/images/projects/telma-santos/work.webp',
    coverImage: '/images/projects/telma-santos/cover.webp',
    mainImage: '/images/projects/telma-santos/main.webp',
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getNextProject(slug: string): Project {
  const idx = projects.findIndex((p) => p.slug === slug)
  return projects[(idx + 1) % projects.length]
}
