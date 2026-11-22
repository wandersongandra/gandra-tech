import fs from 'node:fs'
import path from 'node:path'
import { siteDescription, siteName, brandName, siteUrl, contactEmail } from '../lib/site.ts'
import { siteCatalog } from '../lib/site-catalog.ts'
import { contactSteps } from '../lib/process.ts'

const root = process.cwd()
const target = path.join(root, 'public', 'llms.txt')

function oneLine(value) {
  return value.replace(/\s+/g, ' ').trim()
}

const lines = [
  `# ${siteName}`,
  '',
  `> ${oneLine(siteDescription)}`,
  '',
  '## Sobre',
  '',
  `${brandName} é um estúdio de software digital com base em Vespasiano, na Grande BH, e atendimento remoto em todo o Brasil.`,
  'O trabalho combina direção visual, engenharia web e produtos digitais sob medida.',
  '',
  `- Site: ${siteUrl}`,
  '- Base: Vespasiano, Minas Gerais (Grande BH)',
  `- Contato: ${contactEmail}`,
  '- Resposta inicial: Respondo em até 1 dia útil.',
  '',
  '## Serviços',
  '',
  ...siteCatalog.services.map((service) => `- [${oneLine(service.title)}](${siteUrl}/servicos/${service.slug}): ${oneLine(service.shortDescription)}`),
  '',
  '## Projetos públicos',
  '',
  ...siteCatalog.projects.map((project) => `- [${oneLine(project.name)}](${siteUrl}/trabalhos/${project.slug}) — ${project.category}; ${project.year}. ${oneLine(project.overview)}`),
  '',
  '## Páginas principais',
  '',
  `- Início: ${siteUrl}/`,
  `- Serviços: ${siteUrl}/servicos`,
  `- Trabalhos: ${siteUrl}/trabalhos`,
  `- Orçamento: ${siteUrl}/contato#orcamento — formulário para explicar objetivo, contexto e referências do projeto.`,
  `- Sitemap: ${siteUrl}/sitemap.xml`,
  `- Políticas: ${siteUrl}/politica-de-privacidade, ${siteUrl}/politica-de-cookies e ${siteUrl}/termos-de-uso`,
  '',
  '## Processo de contato',
  '',
  ...contactSteps.map((step, index) => `${index + 1}. ${oneLine(step)}`),
  '',
  '## Limites de interpretação',
  '',
  '- Prazos, investimento, manutenção e condições de titularidade são definidos caso a caso, depois do alinhamento de escopo.',
  '- Cases sem endereço público ou sem resultado medido são apresentados com essa limitação explícita na página correspondente.',
  '',
]

fs.writeFileSync(target, `${lines.join('\n').trimEnd()}\n`)
console.log(`llms.txt gerado a partir de ${siteCatalog.services.length} serviços e ${siteCatalog.projects.length} projetos.`)
