export type ProjectDetail = {
  title: string
  description: string
}

export type Project = {
  slug: string
  name: string
  category: string
  year: string
  headline: string
  overview: string
  services: string[]
  relatedServiceSlugs: string[]
  contexto: string
  desafio: string
  solucao: string
  resultado: string
  papel: string
  stack?: string
  details: ProjectDetail[]
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
    relatedServiceSlugs: ['sistemas-sob-medida', 'aplicacoes-web', 'automacao-de-processos-e-integracoes'],
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
    details: [
      {
        title: 'Centralização da operação',
        description:
          'A proposta do produto parte de um problema recorrente em operações de segurança do trabalho: informações importantes podem ficar espalhadas entre documentos, controles e rotinas diferentes. O SGS organiza essas frentes em uma experiência única, reduzindo a necessidade de alternar entre vários pontos de consulta para acompanhar o que está acontecendo.',
      },
      {
        title: 'Fluxos de segurança do trabalho',
        description:
          'Inspeções, análises preliminares de risco, permissões de trabalho, auditorias, indicadores, documentos e evidências têm naturezas diferentes, mas fazem parte do mesmo contexto operacional. A interface foi estruturada para dar coerência a esses fluxos sem tratar tudo como uma tela genérica, mantendo o foco nas tarefas e informações que cada etapa exige.',
      },
      {
        title: 'Experiência para diferentes contextos de uso',
        description:
          'O projeto também considera uso em telas menores porque parte das consultas e registros pode acontecer longe de uma estação de trabalho. A experiência mobile foi tratada como parte do produto, com hierarquia de informação e navegação pensadas para preservar clareza quando o espaço de tela é mais limitado.',
      },
    ],
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
    relatedServiceSlugs: ['sites-institucionais', 'portfolios-profissionais'],
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
    details: [
      {
        title: 'Uma narrativa para o trabalho',
        description:
          'O portfólio foi pensado para organizar a apresentação profissional como uma sequência de leitura, e não apenas como uma coleção de blocos soltos. A estrutura ajuda quem chega ao site a entender trajetória, atuação e serviços com continuidade, sem depender de contexto externo para compreender o trabalho apresentado.',
      },
      {
        title: 'Identidade visual a serviço do conteúdo',
        description:
          'A direção visual foi construída para dar personalidade à página sem competir com o conteúdo. Tipografia, composição e ritmo ajudam a criar uma presença própria, enquanto a hierarquia mantém as informações profissionais legíveis e fáceis de localizar ao longo da navegação.',
      },
      {
        title: 'Leitura confortável em diferentes telas',
        description:
          'Como boa parte das visitas pode acontecer pelo celular, o projeto preserva a ordem de leitura e a clareza dos conteúdos em telas menores. A interface responsiva reorganiza os elementos sem reduzir o portfólio a uma versão comprimida do desktop.',
      },
    ],
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
