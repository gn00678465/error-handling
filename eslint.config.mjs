import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  pnpm: true,
  stylistics: true,
  ignores: [
    '**/README.md',
  ],
})
