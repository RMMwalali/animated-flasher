import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@next/next/no-img-element': 'off',
    },
  },
  {
    ignores: [
      '.next/**', 'node_modules/**', 'src/payload-types.ts', 'src/migrations/**',
      'src/app/(payload)/admin/importMap.js', 'src/components/brand/paths.ts',
      'scripts/brand/.masks/**', 'playwright-report/**', 'test-results/**', 'next-env.d.ts',
    ],
  },
]
export default config
