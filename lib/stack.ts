/**
 * Tecnologias de fato usadas nos repositórios públicos e privados
 * de wandersongandra. Nada entra nesta lista sem evidência no código.
 */
export const stackGroups = [
  {
    id: 'front',
    label: 'Front',
    items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Astro', 'GSAP', 'Lenis', 'Tailwind'],
  },
  {
    id: 'back',
    label: 'Back',
    items: ['Node.js', 'PHP', 'Laravel', 'Python', 'NestJS'],
  },
  {
    id: 'infra',
    label: 'Infra',
    items: ['Docker', 'Cloudflare Pages', 'Cloudflare Workers', 'PostgreSQL', 'GitHub'],
  },
  {
    id: 'tools',
    label: 'Ferramentas',
    items: ['Playwright'],
  },
] as const

export const stackItems = stackGroups.flatMap((group) => [...group.items])
