const fs = require('node:fs')
const path = require('node:path')

const root = __dirname
const textExtensions = new Set(['.ts', '.tsx'])
const sourceRoots = ['app', 'components', 'lib']
const forbidden = /console\.log|debugger|@ts-ignore|dangerouslySetInnerHTML|\.innerHTML\s*=|document\.write\s*\(|\beval\s*\(|navigator\.serviceWorker\.register\s*\(/
const failures = []
function visit(current) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name)
    if (entry.isDirectory()) {
      visit(absolute)
      continue
    }
    if (!textExtensions.has(path.extname(entry.name).toLowerCase())) continue
    const contents = fs.readFileSync(absolute, 'utf8')
    if (forbidden.test(contents)) failures.push(path.relative(root, absolute))
  }
}

for (const sourceRoot of sourceRoots) visit(path.join(root, sourceRoot))

if (failures.length) {
  console.error(`Padrões proibidos encontrados: ${failures.join(', ')}`)
  process.exit(1)
}

console.log('Lint estrutural passou: nenhuma saída de debug, sink inseguro ou registro de service worker encontrado.')
