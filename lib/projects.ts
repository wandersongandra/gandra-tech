export type Project = {
  slug: string
  name: string
  category: string
  year: string
  headline: string
  overview: string
  services: string[]
  contexto: string
  desafio: string
  solucao: string
  resultado: string
  papel: string
  stack?: string
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
      'Plataforma digital de segurança do trabalho concebida para centralizar inspeções, APRs, permissões de trabalho, auditorias, indicadores, documentos e evidências.',
    services: ['Produto', 'UX / UI', 'Engenharia web', 'Mobile'],
    contexto:
      'O SGS é uma plataforma digital de segurança do trabalho para empresas que precisam centralizar inspeções, APRs, permissões de trabalho, auditorias, indicadores, documentos e evidências.',
    desafio:
      'O projeto foi concebido para reunir, em uma única experiência, informações e rotinas que precisam ser consultadas no dia a dia da operação.',
    solucao:
      'Foi desenvolvida uma plataforma web com uma operação centralizada para organizar essas frentes e dar forma digital aos fluxos do produto.',
    resultado:
      'Objetivo operacional: apoiar a centralização da gestão de segurança do trabalho, oferecendo uma base única para acompanhar informações, documentos e evidências.',
    papel:
      'A Gandra Tecnologia atuou em produto, UX / UI, engenharia web e experiência mobile neste projeto.',
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
    contexto:
      'O projeto é um portfólio profissional desenvolvido para apresentar trabalho, identidade visual e serviços.',
    desafio:
      'O projeto foi concebido para organizar a apresentação do trabalho e tornar a consulta da experiência e dos serviços mais clara.',
    solucao:
      'A solução apresenta uma presença digital com estrutura narrativa, direção visual e interface web voltadas à apresentação profissional.',
    resultado:
      'Objetivo do projeto: oferecer uma presença digital clara para apresentar trabalho, identidade visual e serviços.',
    papel:
      'A Gandra Tecnologia atuou em estratégia visual, design de interface e engenharia web neste projeto.',
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
