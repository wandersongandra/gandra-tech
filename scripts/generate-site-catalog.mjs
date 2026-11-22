import fs from 'node:fs'
import path from 'node:path'
import { commercialRoutes, navigationRoutes, siteCatalog } from '../lib/site-catalog.ts'

const root = process.cwd()
const publicDir = path.join(root, 'public')
const catalog = {
  ...siteCatalog,
  commercialRoutes,
  navigationRoutes,
}

fs.writeFileSync(path.join(publicDir, 'site-catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`)

const swPath = path.join(publicDir, 'sw.js')
const source = fs.readFileSync(swPath, 'utf8')
const generatedRoutes = `const NAVIGATION_PATHS = new Set(${JSON.stringify(navigationRoutes, null, 2)})`
const routePattern = /const NAVIGATION_PATHS = new Set\(\[[\s\S]*?\]\)/
if (!routePattern.test(source)) throw new Error('bloco NAVIGATION_PATHS não encontrado em public/sw.js')
const updated = source.replace(routePattern, generatedRoutes)
fs.writeFileSync(swPath, updated)

console.log(`Catálogo compartilhado gerado: ${siteCatalog.services.length} serviços, ${siteCatalog.projects.length} projetos e ${navigationRoutes.length} rotas.`)
