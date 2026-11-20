/**
 * Inventário das stacks usadas pela Gandra: evidência nos repositórios
 * e tecnologias confirmadas pelo Wanderson.
 */
export const stackGroups = [
  {
    id: 'front',
    label: 'Front',
    items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Astro', 'GSAP', 'Lenis', 'Tailwind', 'Vite', 'Motion', 'OGL', 'WordPress'],
  },
  {
    id: 'back',
    label: 'Back',
    items: ['Node.js', 'PHP', 'Laravel', 'Python', 'NestJS', 'FastAPI', 'Fastify'],
  },
  {
    id: 'infra',
    label: 'Infra',
    items: ['Docker', 'Cloudflare Pages', 'Cloudflare Workers', 'GitHub', 'Nginx', 'AWS S3', 'Vercel', 'Firebase'],
  },
  {
    id: 'data',
    label: 'Dados',
    items: ['PostgreSQL', 'MySQL', 'Redis', 'Supabase'],
  },
  {
    id: 'mobile',
    label: 'Mobile',
    items: ['Flutter'],
  },
  {
    id: 'tools',
    label: 'Ferramentas',
    items: ['Playwright', 'Figma', 'n8n', 'IA'],
  },
] as const

export const stackItems = stackGroups.flatMap((group) => [...group.items])

/** Duas faixas com metade dos nomes cada, para o marquee em sentidos opostos. */
export function stackMarqueeRows(): [string[], string[]] {
  const mid = Math.ceil(stackItems.length / 2)
  return [stackItems.slice(0, mid), stackItems.slice(mid)]
}
