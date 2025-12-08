import { addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@error-handling/nuxt',
    configKey: 'errorHandling',
  },
  setup() {
    const resolver = createResolver(import.meta.url)

    // Register composables
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Register utils
    addImportsDir(resolver.resolve('./runtime/utils'))
  },
})
