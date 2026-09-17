const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')

function loadTypeScriptModule(relativePath) {
  const filename = path.join(root, relativePath)
  const source = fs.readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText
  const module = { exports: {} }
  new Function('exports', 'module', 'require', output)(module.exports, module, require)
  return module.exports
}

const { projects, getNextProject, getProject } = loadTypeScriptModule('lib/projects.ts')
const { services } = loadTypeScriptModule('lib/services.ts')

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} não pode ter duplicatas`)
}

const projectSlugs = projects.map((project) => project.slug)
assert.deepEqual(projectSlugs, ['sgs', 'telma-santos'])
assertUnique(projectSlugs, 'slugs de projetos')

for (const project of projects) {
  for (const field of ['slug', 'name', 'category', 'year', 'headline', 'overview', 'contexto', 'desafio', 'solucao', 'resultado', 'papel', 'workImage', 'coverImage', 'mainImage']) {
    assert.equal(typeof project[field], 'string', `projeto ${project.slug}: ${field} deve ser texto`)
    assert.ok(project[field].trim(), `projeto ${project.slug}: ${field} não pode ser vazio`)
  }
  assert.ok(Array.isArray(project.services) && project.services.length > 0, `projeto ${project.slug}: services inválido`)
  assert.equal(getProject(project.slug), project)
}

assert.equal(getProject('não-existe'), undefined)
assert.equal(getNextProject('sgs').slug, 'telma-santos')
assert.equal(getNextProject('telma-santos').slug, 'sgs')

const serviceSlugs = services.map((service) => service.slug)
assert.deepEqual(serviceSlugs, [
  'sites-institucionais',
  'portfolios-profissionais',
  'sistemas-sob-medida',
  'aplicacoes-web',
  'automacao-de-processos-e-integracoes',
])
assertUnique(serviceSlugs, 'slugs de serviços')

for (const service of services) {
  for (const field of ['slug', 'title', 'shortDescription', 'description', 'idealFor']) {
    assert.equal(typeof service[field], 'string', `serviço ${service.slug}: ${field} deve ser texto`)
    assert.ok(service[field].trim(), `serviço ${service.slug}: ${field} não pode ser vazio`)
  }
  assert.ok(Array.isArray(service.deliverables) && service.deliverables.length > 0, `serviço ${service.slug}: deliverables inválido`)
  if (service.relatedProjectSlug) assert.ok(getProject(service.relatedProjectSlug), `serviço ${service.slug}: projeto relacionado inexistente`)
}

console.log(`Testes de conteúdo passaram: ${projects.length} projetos e ${services.length} serviços válidos.`)
