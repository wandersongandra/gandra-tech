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

// Caça a bugs 2026-10: o Pages responde /offline.html com 308 → /offline; uma
// resposta "redirected" no cache quebra a navegação (net::ERR_FAILED).
assertLab.ok(swSrc.includes('withoutRedirect'), 'sw: respostas redirecionadas precisam ser recriadas antes do cache')
assertLab.doesNotMatch(swSrc, /cache\.addAll\(/, 'sw: cache.addAll guarda respostas redirecionadas')
// Lenis mede a página com atraso: medir de novo antes de rolar para âncora.
const scrollSrc = require('node:fs').readFileSync(require('node:path').join(__dirname, 'lib/scroll.ts'), 'utf8')
assertLab.match(scrollSrc, /resize\?\.\(\)[\s\S]*scrollTo\(selector/, 'scroll: Lenis precisa de resize() antes de scrollTo(âncora)')

// Fluido de tinta 2026-10: chunk lazy em components/surreal/fluid, sem three.js.
{
  const fluidDir = require('node:path').join(__dirname, 'components/surreal/fluid')
  assertLab.ok(require('node:fs').existsSync(require('node:path').join(fluidDir, 'mount.ts')), 'fluid/mount.ts ausente')
  assertLab.ok(require('node:fs').existsSync(require('node:path').join(fluidDir, 'sim.ts')), 'fluid/sim.ts ausente')
  const loader = require('node:fs').readFileSync(require('node:path').join(__dirname, 'components/surreal/SurrealLoader.tsx'), 'utf8')
  assertLab.match(loader, /fluid\/mount/, 'SurrealLoader deve importar o fluido lazy')
  const pkg = require('node:fs').readFileSync(require('node:path').join(__dirname, 'package.json'), 'utf8')
  assertLab.doesNotMatch(pkg, /three|ogl|regl|babylon/i, 'sem libs 3D pesadas no package.json')
  // worker-src continua self (sem blob:) — o fluido não usa Worker/blob.
  const cspGen = require('node:fs').readFileSync(require('node:path').join(__dirname, 'scripts/generate-csp.mjs'), 'utf8')
  assertLab.match(cspGen, /worker-src 'self'/, "CSP worker-src deve permanecer 'self'")
}
