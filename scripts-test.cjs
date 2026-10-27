const fs = require('node:fs')
const path = require('node:path')

const root = __dirname
const source = fs.readFileSync(path.join(root, 'lib', 'projects.ts'), 'utf8')
const slugs = [...source.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])
const expected = ['sgs', 'telma-santos', 'gisley-nunes-imoveis', 'ajn-consultoria-engenharia']
const failures = []

if (JSON.stringify(slugs) !== JSON.stringify(expected)) {
  failures.push(`catálogo inesperado: ${JSON.stringify(slugs)}`)
}

for (const match of source.matchAll(/(?:workImage|coverImage|mainImage|src):\s*'([^']+)'/g)) {
  const relativeAsset = match[1].replace(/^[/\\]+/, '')
  const asset = path.join(root, 'public', relativeAsset)
  if (!fs.existsSync(asset)) failures.push(`asset ausente: ${match[1]}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Testes estruturais passaram: ${slugs.length} projetos e assets válidos.`)

// Guardas de integração da home e da disponibilidade offline.
// O laboratório 3D (WebGL) foi removido do site: garante que não volte por engano.
const homeSrc = require('node:fs').readFileSync(require('node:path').join(__dirname, 'app/page.tsx'), 'utf8')
const swSrc = require('node:fs').readFileSync(require('node:path').join(__dirname, 'public/sw.js'), 'utf8')
const assertLab = require('node:assert/strict')
assertLab.doesNotMatch(homeSrc, /ImmersiveLab/)
for (const removed of ['components/sections/ImmersiveLab.tsx', 'components/motion/OrbitalArtifact.tsx', 'components/motion/HeroBlob.tsx']) {
  assertLab.ok(!require('node:fs').existsSync(require('node:path').join(__dirname, removed)), removed + ' deveria ter sido removido')
}
for (const slug of ['gisley-nunes-imoveis', 'ajn-consultoria-engenharia']) assertLab.ok(swSrc.includes("'/trabalhos/" + slug + "'"))
