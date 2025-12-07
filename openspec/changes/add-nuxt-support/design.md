# Design: Nuxt Support

## Architecture

The solution involves creating a standard Nuxt module structure within `packages/nuxt`.

### Module Structure
The package will follow the standard Nuxt module directory structure:
- `src/module.ts`: The entry point of the module.
- `src/runtime/`: Contains runtime code (composables, plugins).

### `useErrorHandling` Composable

The core of this design is the `useErrorHandling` composable.

**Signature:**
```typescript
function useErrorHandling(
  handlers: HandlersWithDefault,
  options?: ErrorHandlingOptions
): {
  handleError: (error: unknown, overrideHandlers?: Handlers) => Promise<void> | void
}
```

**Interaction with Core:**
The composable acts as a bridge. It imports `errorHandler` from `@error-handling/core` and invokes it.
When `overrideHandlers` is provided to `handleError`, it merges with the `handlers` passed to `useErrorHandling`, with `overrideHandlers` taking precedence.

**Why a Composable?**
- **Idiomatic**: It follows the Vue/Nuxt composition API style.
- **Context**: It allows future access to the Nuxt context (e.g., `useNuxtApp`) if we need to trigger global error pages or toasts, although the initial version might just be a pure wrapper.
- **Reusability**: Can be used in pages, components, or other composables.

### Dependency Management
`@error-handling/nuxt` will have a peer dependency on `nuxt` and a direct dependency on `@error-handling/core`.

### Default Validators
The module will provide built-in validators optimized for the Nuxt ecosystem, specifically handling:
- **`ofetch` Errors**: Nuxt's default data fetching library.
- **`NuxtError`**: Errors thrown by `createError` or internal Nuxt mechanisms.
- **Standard `Error`**: Fallback for generic JS errors.

The `validateError` function will check these in order:
1. `isFetchError` (ofetch)
2. `isNuxtError`
3. `instanceof Error`

## Alternatives Considered

### Plugin instead of Composable
We could register a global `$handleError` helper via a plugin.
*   **Pros**: Available everywhere without import.
*   **Cons**: Less explicit, harder to type strictly with different handlers per usage. Composables are preferred in modern Nuxt.

### Auto-importing Core functions directly
We could just use Nuxt to auto-import `errorHandler` from core.
*   **Pros**: Simpler.
*   **Cons**: Doesn't provide a "Vue-native" feel. Doesn't allow for easy injection of Nuxt-specific behavior (like accessing the router or store) inside the error handling logic in the future.
