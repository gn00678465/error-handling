# Spec: Nuxt Module

## ADDED Requirements

### Requirement: Nuxt Module Registration
The package MUST export a valid Nuxt module that registers the necessary runtime utilities.

#### Scenario: Module Installation
Given a Nuxt application
When the user adds `@error-handling/nuxt` to the `modules` list in `nuxt.config.ts`
Then the module should be loaded successfully
And the `useErrorHandling` composable should be auto-imported and available in pages/components.

### Requirement: `useErrorHandling` Composable
The module MUST provide a `useErrorHandling` composable that wraps the core error handling logic.

#### Scenario: Basic Usage
Given a Nuxt page
When I call `const { handleError } = useErrorHandling(handlers)`
And I call `handleError(fetchError)`
Then the appropriate handler from `handlers` should be executed based on the core logic.

#### Scenario: Override Handlers
Given a Nuxt page
And I have a `useErrorHandling` instance with default handlers
When I call `handleError(error, { [404]: custom404Handler })`
Then the `custom404Handler` should be executed if the error is a 404
And the original handlers should be used for other errors.

#### Scenario: Custom Options
Given a Nuxt page
When I call `useErrorHandling(handlers, { validateError: customValidator })`
Then the `customValidator` should be used during error processing.
