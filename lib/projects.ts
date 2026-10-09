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
  phase?: string
  externalUrl?: string
  externalLabel?: string
  visualNote?: string
  seoTitle: string
  seoDescription: string
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
    seoTitle: 'SGS Segurança — Sistema Sob Medida',
    seoDescription: 'Case de sistema sob medida para gestão de segurança do trabalho, com inspeções, APRs, permissões, auditorias, indicadores e documentos.',
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
    seoTitle: 'Telma Santos — Portfólio Profissional',
    seoDescription: 'Case de portfólio profissional desenvolvido para apresentar trabalho, trajetória, identidade visual e serviços com clareza.',
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
  {
    slug: 'gisley-nunes-imoveis',
    name: 'Gisley Nunes Imóveis',
    category: 'Site e painel administrativo',
    year: '2026',
    headline: 'Um catálogo para quem procura imóveis. Um painel para quem administra.',
    seoTitle: 'Gisley Nunes Imóveis — Site e Painel Administrativo',
    seoDescription: 'Case de site imobiliário com catálogo, filtros, páginas de imóveis e painel Laravel para cadastro, gestão de fotos e atendimento.',
    overview:
      'Site imobiliário com busca de imóveis, páginas detalhadas e um painel de gestão para a equipe cadastrar anúncios, organizar imagens e acompanhar contatos.',
    services: ['Arquitetura de produto', 'UX / UI', 'Frontend', 'Backend'],
    relatedServiceSlugs: ['sites-institucionais', 'sistemas-sob-medida', 'aplicacoes-web'],
    contexto:
      'A Gisley Nunes Imóveis precisava reunir a apresentação da imobiliária, a consulta ao catálogo e as rotinas internas de gestão em uma experiência digital coerente.',
    desafio:
      'O público precisava encontrar imóveis e falar com a equipe sem percorrer telas confusas. Nos bastidores, a gestão dos anúncios e dos contatos exigia acesso reservado e permissões por função.',
    solucao:
      'O projeto reúne páginas institucionais, catálogo com filtros, detalhes e galeria de imóveis, além de painel administrativo para cadastro, edição e organização das informações. A migração do backend para Laravel prevê autenticação por convite e controle de acesso da equipe.',
    resultado:
      'O produto passou por validações técnicas de interface, mobile e segurança. A implantação da versão Laravel e a autenticação real ainda dependem da homologação do ambiente de produção.',
    papel:
      'A Gandra Tech atuou na experiência pública, nas interfaces do painel e na engenharia de frontend e backend do produto imobiliário.',
    stack: 'Laravel, PHP, MySQL, JavaScript e Cloudflare R2',
    phase: 'Implantação em validação',
    visualNote:
      'Composições editoriais das interfaces do projeto. Não são capturas do ambiente de produção.',
    details: [
      {
        title: 'Busca que não atrapalha a escolha',
        description:
          'O catálogo separa finalidade, localização e tipo de imóvel, enquanto a página de cada anúncio dá prioridade às fotos e aos atributos que ajudam na decisão. A navegação foi pensada também para consulta pelo celular.',
      },
      {
        title: 'Um painel para a operação real',
        description:
          'A equipe pode trabalhar com cadastro de imóveis, imagens e contatos em uma área administrativa própria. O modelo de acesso distingue funções e incorpora convites para novos usuários, sem tornar pública a gestão interna.',
      },
      {
        title: 'Preparação para operar com segurança',
        description:
          'A arquitetura Laravel/MySQL, o armazenamento de imagens no R2 e as camadas de autenticação, autorização, proteção de requisições e auditoria foram tratados como parte do produto. A ativação definitiva depende das integrações e da verificação do deploy.',
      },
    ],
    workImage: '/images/projects/gisley-nunes/cover.svg',
    coverImage: '/images/projects/gisley-nunes/cover.svg',
    mainImage: '/images/projects/gisley-nunes/painel.svg',
  },
  {
    slug: 'ajn-consultoria-engenharia',
    name: 'AJN Consultoria e Engenharia',
    category: 'Site institucional',
    year: '2026',
    headline: 'Um novo site para uma engenharia que acontece no campo.',
    seoTitle: 'AJN Consultoria e Engenharia — Site Institucional em Astro',
    seoDescription: 'Case de reconstrução de site institucional em Astro para consultoria em SST e engenharia, com serviços, blog e preservação de URLs.',
    overview:
      'Reconstrução do site institucional da AJN, migrando a estrutura legada em WordPress para páginas estáticas em Astro, com catálogo de serviços, conteúdo técnico e blog.',
    services: ['Direção de interface', 'Engenharia web', 'Conteúdo', 'SEO técnico'],
    relatedServiceSlugs: ['sites-institucionais', 'aplicacoes-web'],
    contexto:
      'A AJN atua em Segurança e Saúde no Trabalho, treinamentos, meio ambiente, qualidade e projetos de engenharia. Seu site reunia páginas institucionais, serviços técnicos e conteúdos de blog construídos ao longo do tempo.',
    desafio:
      'Modernizar a experiência sem descartar a informação existente, perder endereços importantes dos serviços ou depender de um painel de manutenção desnecessário para a rotina da empresa.',
    solucao:
      'A nova base foi desenvolvida com Astro e geração estática. Os serviços, o blog e as páginas institucionais passaram a usar componentes e dados estruturados, preservando as rotas públicas mapeadas e uma navegação adaptada para desktop e mobile.',
    resultado:
      'A versão institucional está acessível no domínio da AJN. O acervo fotográfico e o conteúdo técnico seguem em revisão editorial, sem necessidade de runtime de banco de dados para servir as páginas.',
    papel:
      'A Gandra Tech conduziu a migração de frontend, organização de templates, responsividade, apresentação dos serviços e trabalho de SEO técnico.',
    stack: 'Astro, TypeScript, CSS e publicação estática',
    externalUrl: 'https://ajnengenharia.com.br/',
    externalLabel: 'Visitar o site da AJN',
    visualNote:
      'Composição editorial baseada na interface e em imagens do acervo da AJN; não é uma captura literal da página.',
    details: [
      {
        title: 'Conteúdo preservado, estrutura renovada',
        description:
          'A migração partiu do inventário de URLs do WordPress. Mais de 140 rotas de conteúdo foram reconstituídas em templates estáticos, incluindo serviços, blog e páginas institucionais, para manter caminhos importantes acessíveis.',
      },
      {
        title: 'O serviço técnico em primeiro plano',
        description:
          'Segurança do trabalho, saúde ocupacional, prevenção de incêndios e engenharia ganharam apresentações específicas, com caminhos claros para consultar o escopo e solicitar atendimento. O desenho evita tratar áreas técnicas diferentes como se fossem o mesmo serviço.',
      },
      {
        title: 'Menos complexidade para manter',
        description:
          'Sem painel administrativo nem banco de dados na entrega estática, o conteúdo pode ser versionado e revisado junto ao código. As mudanças passam por validação antes da publicação, enquanto as imagens do acervo recebem seleção editorial por contexto.',
      },
    ],
    workImage: '/images/projects/ajn/cover.svg',
    coverImage: '/images/projects/ajn/cover.svg',
    mainImage: '/images/projects/ajn/servicos.svg',
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getNextProject(slug: string): Project {
  const idx = projects.findIndex((p) => p.slug === slug)
  return projects[(idx + 1) % projects.length]
}
