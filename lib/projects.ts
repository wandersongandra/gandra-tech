export type Project = {
  slug: string
  name: string
  category: string
  year: string
  headline: string
  overview: string
  services: string[]
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
    coverImage: '/images/projects/sgs/cover.png',
    mainImage: '/images/projects/sgs/main.png',
  },
  {
    slug: 'axiom-health',
    name: 'Axiom Health',
    category: 'Plataforma digital',
    year: '2026',
    headline: 'Saúde corporativa com clareza e eficiência.',
    overview:
      'Sistema de gestão de saúde ocupacional pensado para times de RH e médicos do trabalho. Dashboards, prontuários digitais e fluxos de agendamento em uma interface sem ruído.',
    services: ['Produto', 'UX / UI', 'Engenharia web'],
    coverImage: '/images/work/axiom-health.png',
    mainImage: '/images/work/axiom-health.png',
  },
  {
    slug: 'norte-vivo',
    name: 'Norte Vivo',
    category: 'Sistema de marca',
    year: '2025',
    headline: 'Uma identidade viva para uma região em crescimento.',
    overview:
      'Desenvolvimento de sistema de marca completo para organização regional de desenvolvimento econômico. Identidade visual, direção de movimento e presença digital.',
    services: ['Identidade', 'Motion', 'Web'],
    coverImage: '/images/work/norte-vivo.png',
    mainImage: '/images/work/norte-vivo.png',
  },
  {
    slug: 'marea-finance',
    name: 'Marea Finance',
    category: 'Experiência de produto',
    year: '2025',
    headline: 'Finanças pessoais que fazem sentido na tela.',
    overview:
      'Redesign completo de plataforma de gestão financeira pessoal. Foco em clareza de dados, hierarquia visual e fluxos que reduzem fricção no dia a dia financeiro.',
    services: ['UX / UI', 'Design de produto', 'Protótipo'],
    coverImage: '/images/work/marea-finance.png',
    mainImage: '/images/work/marea-finance.png',
  },
  {
    slug: 'orbit-house',
    name: 'Orbit House',
    category: 'Experiência web',
    year: '2024',
    headline: 'Imóveis de alto padrão com presença editorial.',
    overview:
      'Site institucional para incorporadora premium com foco em experiência de scrollytelling. Cada seção comunica exclusividade através de movimento controlado e tipografia de impacto.',
    services: ['Web', 'Motion', 'Copywriting'],
    coverImage: '/images/work/orbit-house.png',
    mainImage: '/images/work/orbit-house.png',
  },
  {
    slug: 'vertice-open',
    name: 'Vértice Open',
    category: 'Identidade digital',
    year: '2024',
    headline: 'Open banking com a confiança de uma instituição sólida.',
    overview:
      'Identidade digital e sistema de design para fintech de open banking. Criação de componentes, guia de tom de voz e templates de comunicação para canais digitais.',
    services: ['Identidade', 'Design system', 'Brand guidelines'],
    coverImage: '/images/work/vertice-open.png',
    mainImage: '/images/work/vertice-open.png',
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getNextProject(slug: string): Project {
  const idx = projects.findIndex((p) => p.slug === slug)
  return projects[(idx + 1) % projects.length]
}
