export type Service = {
  slug: string
  title: string
  shortDescription: string
  description: string
  idealFor: string
  deliverables: string[]
  relatedProjectSlug?: string
}

export const services: Service[] = [
  {
    slug: 'sites-institucionais',
    title: 'Sites institucionais',
    shortDescription: 'Presença digital profissional para explicar o negócio e gerar confiança.',
    description:
      'A Gandra Tecnologia desenvolve sites institucionais que organizam a mensagem da empresa, apresentam seus diferenciais e facilitam o próximo contato.',
    idealFor: 'Empresas que precisam apresentar sua atuação com clareza, credibilidade e uma experiência consistente em qualquer tela.',
    deliverables: [
      'Arquitetura de conteúdo orientada ao público e ao objetivo do negócio.',
      'Interface responsiva com identidade visual coerente.',
      'Implementação web com conteúdo acessível aos mecanismos de busca.',
      'Publicação e orientações para a continuidade do site.',
    ],
    relatedProjectSlug: 'telma-santos',
  },
  {
    slug: 'portfolios-profissionais',
    title: 'Portfólios profissionais',
    shortDescription: 'Uma apresentação digital autoral para mostrar trabalho, trajetória e serviços.',
    description:
      'A Gandra Tecnologia cria portfólios profissionais para transformar experiência e projetos em uma presença digital clara, memorável e fácil de consultar.',
    idealFor: 'Profissionais liberais, especialistas e criadores que precisam apresentar trabalho, repertório e formas de contato.',
    deliverables: [
      'Estrutura narrativa para destacar projetos e experiência.',
      'Direção visual alinhada à personalidade profissional.',
      'Galeria ou arquivo de trabalhos com navegação objetiva.',
      'Experiência responsiva para leitura em celular e desktop.',
    ],
    relatedProjectSlug: 'telma-santos',
  },
  {
    slug: 'sistemas-sob-medida',
    title: 'Sistemas sob medida',
    shortDescription: 'Software para organizar a operação interna, dashboards, fluxos de trabalho e regras de negócio.',
    description:
      'A Gandra Tecnologia desenvolve sistemas sob medida para a operação interna de empresas, organizando gestão, dashboards, fluxos de trabalho e regras de negócio em experiências web alinhadas ao processo real.',
    idealFor: 'Empresas com processos próprios, regras de negócio específicas ou necessidade de integrar operação e informação.',
    deliverables: [
      'Entendimento do processo e definição do escopo do produto.',
      'Modelagem de fluxos, permissões e experiências de uso.',
      'Implementação web orientada ao contexto operacional.',
      'Evolução planejada conforme as prioridades do negócio.',
    ],
    relatedProjectSlug: 'sgs',
  },
  {
    slug: 'aplicacoes-web',
    title: 'Aplicações web',
    shortDescription: 'Produtos e experiências acessados pelo navegador por clientes, equipes ou usuários finais.',
    description:
      'A Gandra Tecnologia cria aplicações web para entregar produtos e experiências acessadas pelo navegador, com interface voltada a clientes ou usuários finais.',
    idealFor: 'Negócios que precisam oferecer uma ferramenta digital, uma área de trabalho ou uma experiência interativa na web.',
    deliverables: [
      'Definição da jornada principal e das informações necessárias.',
      'Interface para tarefas frequentes e diferentes tamanhos de tela.',
      'Construção do front-end e integração com os serviços necessários.',
      'Base técnica preparada para manutenção e novas etapas.',
    ],
    relatedProjectSlug: 'sgs',
  },
  {
    slug: 'automacao-de-processos-e-integracoes',
    title: 'Automação de processos e integrações',
    shortDescription: 'Conexão de ferramentas e sistemas para automatizar rotinas e sincronizar dados entre etapas.',
    description:
      'A Gandra Tecnologia conecta ferramentas e sistemas para eliminar tarefas manuais repetitivas e sincronizar dados entre etapas do negócio.',
    idealFor: 'Empresas que usam diferentes ferramentas e precisam conectar rotinas, informações e etapas operacionais.',
    deliverables: [
      'Integrações via API e webhooks.',
      'Automação de rotinas administrativas e operacionais.',
      'Sincronização entre sistemas e planilhas.',
      'Pipelines de dados e relatórios automáticos.',
    ],
  },
]
