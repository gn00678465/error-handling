import { defineConfig } from 'tsdown'

export default defineConfig({
  exports: true,
  format: ['esm'],
  dts: {
    sourcemap: true,
  },
  unbundle: true,
  skipNodeModulesBundle: true,
})
