import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  pnpm: true,
  stylistics: true,
  ignores: [
    '**/README.md',
    '.github/**',
    'openspec/**',
    'AGENTS.md',
    'CLAUDE.md',
    '.serena/**',
  ],
})
