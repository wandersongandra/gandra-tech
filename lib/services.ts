export type ServiceProcessStep = {
  title: string
  description: string
}

export type ServiceFaq = {
  question: string
  answer: string
}

export type Service = {
  slug: string
  title: string
  shortDescription: string
  description: string
  idealFor: string
  deliverables: string[]
  relatedProjectSlug?: string
  relatedServiceSlugs: string[]
  seoTitle: string
  seoDescription: string
  headline: string
  lead: string
  painPoints: string[]
  process: ServiceProcessStep[]
  faq: ServiceFaq[]
}

export const services: Service[] = [
  {
    slug: 'sites-institucionais',
    title: 'Sites institucionais',
    shortDescription: 'Presença digital profissional para explicar o negócio e gerar confiança.',
    description:
      'A Gandra Tecnologia desenvolve sites institucionais que organizam a mensagem da empresa, apresentam seus diferenciais e facilitam o próximo contato.',
    idealFor:
      'Empresas que precisam apresentar sua atuação com clareza, credibilidade e uma experiência consistente em qualquer tela.',
    deliverables: [
      'Arquitetura de conteúdo orientada ao público e ao objetivo do negócio.',
      'Interface responsiva com identidade visual coerente.',
      'Implementação web com conteúdo acessível aos mecanismos de busca.',
      'Publicação e orientações para a continuidade do site.',
    ],
    relatedProjectSlug: 'telma-santos',
    relatedServiceSlugs: ['portfolios-profissionais', 'aplicacoes-web'],
    seoTitle: 'Desenvolvimento de Sites Institucionais',
    seoDescription:
      'Desenvolvimento de sites institucionais sob medida para empresas, com arquitetura de conteúdo, design responsivo, SEO técnico e publicação.',
    headline: 'Sites institucionais para explicar melhor o negócio e transformar visita em contato.',
    lead:
      'Um site institucional precisa responder com clareza o que a empresa faz, para quem faz e como o visitante pode avançar. O projeto combina conteúdo, design e engenharia para criar uma presença digital profissional, rápida e fácil de manter.',
    painPoints: [
      'Site antigo, lento ou difícil de usar no celular.',
      'Mensagem comercial confusa, com serviços e diferenciais pouco claros.',
      'Dependência de páginas genéricas que não representam a identidade da empresa.',
    ],
    process: [
      {
        title: 'Estrutura e mensagem',
        description:
          'Organizamos páginas, prioridades e conteúdo a partir do público, do posicionamento e do objetivo comercial do site.',
      },
      {
        title: 'Design responsivo',
        description:
          'Construímos a interface para funcionar com consistência em celular e desktop, sem depender de um template genérico.',
      },
      {
        title: 'Implementação e publicação',
        description:
          'Entregamos a aplicação web preparada para indexação, desempenho, acessibilidade e continuidade do conteúdo.',
      },
    ],
    faq: [
      {
        question: 'Quanto tempo leva para desenvolver um site institucional?',
        answer:
          'O prazo depende da quantidade de páginas, do conteúdo disponível e do nível de personalização. O cronograma é definido depois de entender o escopo e as prioridades do projeto.',
      },
      {
        question: 'O site é preparado para aparecer no Google?',
        answer:
          'A implementação inclui base técnica para indexação, metadados, estrutura semântica, sitemap e boas práticas de desempenho. Posicionamento orgânico também depende de conteúdo, autoridade e concorrência.',
      },
      {
        question: 'Vocês atendem empresas fora da cidade?',
        answer:
          'Sim. O atendimento é remoto e os projetos podem ser conduzidos com empresas e profissionais em qualquer região do Brasil.',
      },
    ],
  },
  {
    slug: 'portfolios-profissionais',
    title: 'Portfólios profissionais',
    shortDescription: 'Uma apresentação digital autoral para mostrar trabalho, trajetória e serviços.',
    description:
      'A Gandra Tecnologia cria portfólios profissionais para transformar experiência e projetos em uma presença digital clara, memorável e fácil de consultar.',
    idealFor:
      'Profissionais liberais, especialistas e criadores que precisam apresentar trabalho, repertório e formas de contato.',
    deliverables: [
      'Estrutura narrativa para destacar projetos e experiência.',
      'Direção visual alinhada à personalidade profissional.',
      'Galeria ou arquivo de trabalhos com navegação objetiva.',
      'Experiência responsiva para leitura em celular e desktop.',
    ],
    relatedProjectSlug: 'telma-santos',
    relatedServiceSlugs: ['sites-institucionais', 'aplicacoes-web'],
    seoTitle: 'Criação de Portfólios Profissionais',
    seoDescription:
      'Criação de portfólios profissionais sob medida para especialistas, consultores e criadores apresentarem projetos, trajetória e serviços.',
    headline: 'Portfólios profissionais para apresentar trabalho, repertório e posicionamento.',
    lead:
      'Um bom portfólio não é apenas uma galeria. Ele organiza trajetória, projetos, serviços e contexto para que quem chega entenda rapidamente o valor do trabalho e encontre um caminho claro para entrar em contato.',
    painPoints: [
      'Trabalhos relevantes espalhados entre redes sociais, PDFs e links soltos.',
      'Dificuldade de apresentar experiência e serviços em uma narrativa única.',
      'Portfólio visualmente genérico ou pouco confortável de consultar no celular.',
    ],
    process: [
      {
        title: 'Curadoria',
        description:
          'Selecionamos o que precisa ser apresentado e definimos uma hierarquia que favoreça leitura, contexto e continuidade.',
      },
      {
        title: 'Direção visual',
        description:
          'A interface é desenhada para reforçar a identidade profissional sem competir com os trabalhos apresentados.',
      },
      {
        title: 'Publicação',
        description:
          'O portfólio é implementado de forma responsiva, com estrutura técnica para compartilhamento, indexação e manutenção.',
      },
    ],
    faq: [
      {
        question: 'O portfólio pode ter domínio próprio?',
        answer:
          'Sim. O projeto pode ser publicado em domínio próprio, com configuração de metadados, compartilhamento social e páginas específicas para trabalhos ou serviços.',
      },
      {
        question: 'Preciso ter todos os textos e projetos prontos antes de começar?',
        answer:
          'Não necessariamente. O levantamento inicial ajuda a definir o que já existe, o que precisa ser organizado e quais materiais faltam antes da implementação.',
      },
      {
        question: 'É possível adicionar novos trabalhos depois?',
        answer:
          'Sim. A estrutura pode ser planejada para receber novos projetos sem comprometer a navegação ou a consistência visual.',
      },
    ],
  },
  {
    slug: 'sistemas-sob-medida',
    title: 'Sistemas sob medida',
    shortDescription:
      'Software para organizar a operação interna, dashboards, fluxos de trabalho e regras de negócio.',
    description:
      'A Gandra Tecnologia desenvolve sistemas sob medida para a operação interna de empresas, organizando gestão, dashboards, fluxos de trabalho e regras de negócio em experiências web alinhadas ao processo real.',
    idealFor:
      'Empresas com processos próprios, regras de negócio específicas ou necessidade de integrar operação e informação.',
    deliverables: [
      'Entendimento do processo e definição do escopo do produto.',
      'Modelagem de fluxos, permissões e experiências de uso.',
      'Implementação web orientada ao contexto operacional.',
      'Evolução planejada conforme as prioridades do negócio.',
    ],
    relatedProjectSlug: 'sgs',
    relatedServiceSlugs: ['aplicacoes-web', 'automacao-de-processos-e-integracoes'],
    seoTitle: 'Desenvolvimento de Sistemas Sob Medida',
    seoDescription:
      'Desenvolvimento de sistemas sob medida para empresas com processos próprios, dashboards, permissões, fluxos operacionais e regras de negócio.',
    headline: 'Sistemas sob medida para processos que não cabem em software genérico.',
    lead:
      'Quando a operação depende de regras, documentos, aprovações, indicadores ou fluxos muito específicos, adaptar o negócio a uma ferramenta pronta pode criar mais atrito. Um sistema sob medida parte do processo real e evolui conforme a prioridade da empresa.',
    painPoints: [
      'Planilhas e ferramentas isoladas usadas para controlar uma mesma operação.',
      'Processos dependentes de conferência manual, retrabalho ou informações duplicadas.',
      'Software pronto que exige contornos porque não representa as regras do negócio.',
    ],
    process: [
      {
        title: 'Mapeamento da operação',
        description:
          'Levantamos usuários, etapas, permissões, dados e exceções antes de transformar o processo em telas e regras.',
      },
      {
        title: 'Produto e arquitetura',
        description:
          'Definimos fluxos principais, modelo de informação e prioridades para construir uma base que possa evoluir sem perder controle.',
      },
      {
        title: 'Entrega incremental',
        description:
          'A implementação é organizada por etapas verificáveis, permitindo validar o produto com o contexto real de uso.',
      },
    ],
    faq: [
      {
        question: 'Quando vale a pena desenvolver um sistema sob medida?',
        answer:
          'Faz sentido quando o processo é específico, há muita adaptação manual nas ferramentas atuais ou o software pronto limita regras importantes da operação.',
      },
      {
        question: 'O sistema pode ter diferentes níveis de acesso?',
        answer:
          'Sim. Perfis, permissões e regras de acesso podem fazer parte da arquitetura quando o processo exige separação de responsabilidades.',
      },
      {
        question: 'É possível começar por uma versão menor e evoluir depois?',
        answer:
          'Sim. Um escopo inicial bem definido permite validar os fluxos mais importantes primeiro e planejar novas etapas conforme o uso e as prioridades do negócio.',
      },
    ],
  },
  {
    slug: 'aplicacoes-web',
    title: 'Aplicações web',
    shortDescription:
      'Produtos e experiências acessados pelo navegador por clientes, equipes ou usuários finais.',
    description:
      'A Gandra Tecnologia cria aplicações web para entregar produtos e experiências acessadas pelo navegador, com interface voltada a clientes ou usuários finais.',
    idealFor:
      'Negócios que precisam oferecer uma ferramenta digital, uma área de trabalho ou uma experiência interativa na web.',
    deliverables: [
      'Definição da jornada principal e das informações necessárias.',
      'Interface para tarefas frequentes e diferentes tamanhos de tela.',
      'Construção do front-end e integração com os serviços necessários.',
      'Base técnica preparada para manutenção e novas etapas.',
    ],
    relatedProjectSlug: 'sgs',
    relatedServiceSlugs: ['sistemas-sob-medida', 'automacao-de-processos-e-integracoes'],
    seoTitle: 'Desenvolvimento de Aplicações Web',
    seoDescription:
      'Desenvolvimento de aplicações web responsivas para produtos digitais, áreas de cliente, ferramentas internas e experiências acessadas pelo navegador.',
    headline:
      'Aplicações web para produtos, áreas de cliente e operações acessadas pelo navegador.',
    lead:
      'Aplicações web combinam interface, regras e integrações em uma experiência acessível pelo navegador. O projeto pode atender usuários externos, equipes internas ou ambos, sempre partindo das tarefas que precisam ser resolvidas com clareza.',
    painPoints: [
      'Processo que precisa sair de planilhas ou ferramentas improvisadas.',
      'Produto digital que precisa funcionar em diferentes dispositivos sem instalação local.',
      'Jornada de usuário fragmentada entre várias ferramentas e etapas manuais.',
    ],
    process: [
      {
        title: 'Jornada principal',
        description:
          'Definimos quem usa o produto, quais tarefas são prioritárias e quais informações precisam estar disponíveis em cada etapa.',
      },
      {
        title: 'Interface e integrações',
        description:
          'A aplicação é desenhada para o fluxo real e conectada aos serviços necessários por APIs, autenticação ou outras integrações.',
      },
      {
        title: 'Base para evolução',
        description:
          'A implementação considera manutenção, observabilidade e crescimento do produto conforme novas necessidades aparecem.',
      },
    ],
    faq: [
      {
        question: 'Aplicação web é a mesma coisa que um site?',
        answer:
          'Não. Um site normalmente apresenta conteúdo e conduz o visitante, enquanto uma aplicação web executa tarefas, manipula dados e oferece fluxos de uso mais interativos.',
      },
      {
        question: 'A aplicação pode funcionar no celular?',
        answer:
          'Sim. A experiência pode ser planejada para telas menores desde o início, respeitando as tarefas e limitações de uso em dispositivos móveis.',
      },
      {
        question: 'É possível integrar a aplicação com outros sistemas?',
        answer:
          'Sim, quando os sistemas envolvidos disponibilizam APIs, webhooks ou outros meios de integração adequados ao projeto.',
      },
    ],
  },
  {
    slug: 'automacao-de-processos-e-integracoes',
    title: 'Automação de processos e integrações',
    shortDescription:
      'Conexão de ferramentas e sistemas para automatizar rotinas e sincronizar dados entre etapas.',
    description:
      'A Gandra Tecnologia conecta ferramentas e sistemas para eliminar tarefas manuais repetitivas e sincronizar dados entre etapas do negócio.',
    idealFor:
      'Empresas que usam diferentes ferramentas e precisam conectar rotinas, informações e etapas operacionais.',
    deliverables: [
      'Integrações via API e webhooks.',
      'Automação de rotinas administrativas e operacionais.',
      'Sincronização entre sistemas e planilhas.',
      'Pipelines de dados e relatórios automáticos.',
    ],
    relatedServiceSlugs: ['sistemas-sob-medida', 'aplicacoes-web'],
    seoTitle: 'Automação de Processos e Integrações',
    seoDescription:
      'Automação de processos empresariais e integrações entre sistemas, APIs, webhooks, planilhas e rotinas operacionais.',
    headline: 'Automação de processos para reduzir tarefas manuais e conectar ferramentas.',
    lead:
      'Automação faz sentido quando uma equipe repete os mesmos passos, copia dados entre sistemas ou depende de conferências manuais para manter a operação atualizada. O objetivo é remover atrito sem criar uma solução mais difícil de manter do que o processo original.',
    painPoints: [
      'Dados copiados manualmente entre planilhas, sistemas e plataformas.',
      'Rotinas repetitivas que consomem tempo e aumentam a chance de inconsistência.',
      'Ferramentas que funcionam bem isoladamente, mas não trocam informações entre si.',
    ],
    process: [
      {
        title: 'Mapeamento da rotina',
        description:
          'Identificamos entradas, saídas, responsáveis, exceções e pontos em que a automação realmente reduz trabalho manual.',
      },
      {
        title: 'Integração segura',
        description:
          'Conectamos serviços por APIs, webhooks ou outros mecanismos suportados, respeitando autenticação e limites de cada plataforma.',
      },
      {
        title: 'Validação e monitoramento',
        description:
          'A automação é testada com cenários reais e preparada para lidar com falhas, reprocessamentos e mudanças de integração.',
      },
    ],
    faq: [
      {
        question: 'Que tipos de processo podem ser automatizados?',
        answer:
          'Rotinas de sincronização de dados, notificações, geração de relatórios, atualização de registros e integração entre sistemas são exemplos comuns. A viabilidade depende das ferramentas envolvidas.',
      },
      {
        question: 'Vocês integram sistemas por API?',
        answer:
          'Sim. Quando os serviços oferecem APIs ou webhooks adequados, a integração pode ser projetada para trocar dados e acionar rotinas automaticamente.',
      },
      {
        question: 'Automação substitui um sistema sob medida?',
        answer:
          'Nem sempre. Às vezes basta conectar ferramentas existentes; em outros casos, o processo precisa de uma aplicação própria. A decisão depende da regra de negócio, volume e manutenção esperada.',
      },
    ],
  },
]

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug)
}
