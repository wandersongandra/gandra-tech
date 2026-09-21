import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const failures = []

const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'))
const npmrc = fs.readFileSync(path.join(root, '.npmrc'), 'utf8')

if (!/^ignore-scripts=true$/m.test(npmrc)) {
  failures.push('.npmrc precisa manter ignore-scripts=true')
}

if (lock.lockfileVersion !== 3) {
  failures.push(`package-lock.json usa lockfileVersion ${lock.lockfileVersion}; esperado: 3`)
}

for (const [name, pkg] of Object.entries(lock.packages ?? {})) {
  if (!name || !pkg || typeof pkg !== 'object') continue

  const resolved = typeof pkg.resolved === 'string' ? pkg.resolved : ''
  const integrity = typeof pkg.integrity === 'string' ? pkg.integrity : ''

  if (resolved && !resolved.startsWith('https://registry.npmjs.org/')) {
    failures.push(`dependência fora do registry oficial: ${name} -> ${resolved}`)
  }

  if (resolved && !integrity.startsWith('sha512-')) {
    failures.push(`integridade forte ausente: ${name}`)
  }
}

const workflowDir = path.join(root, '.github', 'workflows')
for (const entry of fs.readdirSync(workflowDir, { withFileTypes: true })) {
  if (!entry.isFile() || !/\.ya?ml$/i.test(entry.name)) continue

  const file = path.join(workflowDir, entry.name)
  const source = fs.readFileSync(file, 'utf8')

  for (const match of source.matchAll(/^\s*uses:\s*([^\s#]+)\s*$/gm)) {
    const use = match[1]
    if (use.startsWith('./') || use.startsWith('docker://')) continue

    const at = use.lastIndexOf('@')
    const ref = at >= 0 ? use.slice(at + 1) : ''
    if (!/^[a-f0-9]{40}$/i.test(ref)) {
      failures.push(`${entry.name}: action não fixada por SHA: ${use}`)
    }
  }

  for (const match of source.matchAll(/npm ci[^\n]*/g)) {
    if (!match[0].includes('--ignore-scripts')) {
      failures.push(`${entry.name}: npm ci sem --ignore-scripts: ${match[0].trim()}`)
    }
  }
}

if (failures.length) {
  console.error('Validação da cadeia de suprimentos falhou:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log('Cadeia de suprimentos validada: registry oficial, SHA-512, actions pinadas e install scripts bloqueados.')
}
