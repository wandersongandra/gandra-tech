import fs from 'node:fs'
import path from 'node:path'

const root = process.argv[2] || 'codeql-results'

function collect(directory) {
  if (!fs.existsSync(directory)) return []
  const entries = fs.readdirSync(directory, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return collect(target)
    return entry.name.endsWith('.sarif') ? [target] : []
  })
}

const files = collect(root)
if (!files.length) {
  console.log('Nenhum SARIF encontrado para resumo.')
  process.exit(0)
}

for (const file of files) {
  const sarif = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const run of sarif.runs ?? []) {
    const rules = new Map(
      (run.tool?.driver?.rules ?? []).map((rule) => [rule.id, rule]),
    )

    for (const result of run.results ?? []) {
      const rule = rules.get(result.ruleId)
      const severity =
        rule?.properties?.['security-severity'] ??
        rule?.properties?.['problem.severity'] ??
        result.level ??
        'unknown'
      const message = result.message?.text ?? result.message?.markdown ?? ''
      const location = result.locations?.[0]?.physicalLocation
      const uri = location?.artifactLocation?.uri ?? '(sem arquivo)'
      const line = location?.region?.startLine ?? '?'

      console.log(
        JSON.stringify({
          ruleId: result.ruleId ?? 'unknown',
          severity: String(severity),
          location: `${uri}:${line}`,
          message,
        }),
      )
    }
  }
}
