import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['**/*.{jsx,tsx}'],
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'next-env.d.ts',
    'public/**',
    'scripts/**',
    'artifacts/**',
    'qa-baseline/**',
    'qa-after/**',
  ]),
])
