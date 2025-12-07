# Tasks: Add Nuxt Support

- [x] Initialize `packages/nuxt` structure <!-- id: init-pkg -->
  - [x] Update `package.json` with correct dependencies (nuxt, @nuxt/kit, @error-handling/core).
  - [x] Configure build tools (e.g., `unbuild` or `tsup` compatible with Nuxt modules).
- [x] Implement `useErrorHandling` composable <!-- id: impl-composable -->
  - [x] Create `src/runtime/composables/useErrorHandling.ts`.
  - [x] Implement the wrapper around `@error-handling/core`.
- [x] Implement Nuxt Validators <!-- id: impl-validators -->
  - [x] Create `src/runtime/utils/validators.ts`.
  - [x] Implement `isFetchError`, `isNuxtError`, and `validateError` based on the design.
  - [x] Integrate `validateError` as the default validator in `useErrorHandling`.
- [x] Implement Nuxt Module <!-- id: impl-module -->
  - [x] Create `src/module.ts`.
  - [x] Register the composable using `addImports` or `addImportsDir`.
- [x] Add Tests <!-- id: tests -->
  - [x] Setup Vitest for Nuxt package.
  - [x] Write unit tests for `useErrorHandling`.
- [x] Documentation <!-- id: docs -->
  - [x] Add README.md for `packages/nuxt`.
