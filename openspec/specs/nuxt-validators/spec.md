# nuxt-validators Specification

## Purpose
TBD - created by archiving change add-nuxt-support. Update Purpose after archive.
## Requirements
### Requirement: Default Error Validation
The package MUST provide default validation logic that supports common Nuxt error types.

#### Scenario: Validating ofetch Errors
Given an error thrown by `ofetch` (e.g. 404 response)
When `validateError` is called with this error
Then it should return `true`
And the error should be identified as a `FetchError`.

#### Scenario: Validating NuxtErrors
Given an error created via `createError` (NuxtError)
When `validateError` is called with this error
Then it should return `true`
And the error should be identified as a `NuxtError`.

#### Scenario: Validating Standard Errors
Given a standard JavaScript `Error`
When `validateError` is called with this error
Then it should return `true`.

#### Scenario: Invalid Errors
Given a non-object error (e.g. a string or number)
When `validateError` is called with this error
Then it should throw the error (re-throw).

