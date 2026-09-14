const fs = require('node:fs')
const path = require('node:path')

const root = __dirname
const source = fs.readFileSync(path.join(root, 'lib', 'projects.ts'), 'utf8')
const slugs = [...source.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])
const expected = ['sgs', 'telma-santos']
const failures = []

if (JSON.stringify(slugs) !== JSON.stringify(expected)) {
  failures.push(`catálogo inesperado: ${JSON.stringify(slugs)}`)
}

for (const match of source.matchAll(/(?:workImage|coverImage|mainImage):\s*'([^']+)'/g)) {
  const relativeAsset = match[1].replace(/^[/\\]+/, '')
  const asset = path.join(root, 'public', relativeAsset)
  if (!fs.existsSync(asset)) failures.push(`asset ausente: ${match[1]}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Testes estruturais passaram: ${slugs.length} projetos e assets válidos.`)
