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

// Guardas de integração para o laboratório 3D e a disponibilidade offline.
const homeSrc = require('node:fs').readFileSync(require('node:path').join(__dirname, 'app/page.tsx'), 'utf8')
const labSrc = require('node:fs').readFileSync(require('node:path').join(__dirname, 'components/sections/ImmersiveLab.tsx'), 'utf8')
const shaderSrc = require('node:fs').readFileSync(require('node:path').join(__dirname, 'components/motion/OrbitalArtifact.tsx'), 'utf8')
const swSrc = require('node:fs').readFileSync(require('node:path').join(__dirname, 'public/sw.js'), 'utf8')
const assertLab = require('node:assert/strict')
assertLab.match(homeSrc, /<ImmersiveLab\s*\/>/)
assertLab.match(labSrc, /aria-labelledby="lab-heading"/)
assertLab.match(shaderSrc, /IntersectionObserver/)
assertLab.match(shaderSrc, /nearViewport \? <OrbitalRenderer hostRef=\{hostRef\} \/>/)
assertLab.match(shaderSrc, /rect\.height \+ window\.innerHeight/)
assertLab.match(shaderSrc, /prefers-reduced-motion/)
assertLab.match(shaderSrc, /gl\.deleteProgram\(program\)/)
for (const slug of ['gisley-nunes-imoveis', 'ajn-consultoria-engenharia']) assertLab.ok(swSrc.includes("'/trabalhos/" + slug + "'"))
