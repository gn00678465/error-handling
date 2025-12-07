# Add Nuxt Support

## Summary
Introduce a new package `@error-handling/nuxt` to provide first-class support for Nuxt applications. This package will expose a Nuxt module that registers a `useErrorHandling` composable, enabling developers to easily integrate the core error handling logic into their Nuxt apps.

## Problem
Currently, `@error-handling/core` is framework-agnostic. Nuxt developers have to manually import and configure the core functions, which leads to boilerplate code and potential inconsistencies across different Nuxt projects. There is no standard "Nuxt way" to use this library.

## Solution
Create a dedicated Nuxt module that:
1.  Auto-imports or registers a `useErrorHandling` composable.
2.  Wraps the core `errorHandler` logic in a Vue composable pattern.
3.  Provides a seamless developer experience for Nuxt users.

## Impact
- **New Package**: `packages/nuxt`
- **Dependencies**: `@error-handling/core`
- **Users**: Nuxt application developers using this error handling library.
