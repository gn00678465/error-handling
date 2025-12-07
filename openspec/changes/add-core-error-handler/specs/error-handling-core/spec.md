# Specification: Error Handling Core

## Overview
This specification defines the core error handling capabilities for HTTP errors, focusing on the native `fetch` API with extensibility for other HTTP clients.

---

## ADDED Requirements

### Requirement: Error Handler API

The system MUST provide an `errorHandler` function as the primary API for handling HTTP errors.

**Acceptance Criteria:**
- Function signature: `errorHandler<T>(error: unknown, handlers: HandlersWithDefault<T>, options?: ErrorHandlerOptions<T>): Promise<void>`
- Accepts an unknown error object
- Accepts a handlers object with mandatory `DEFAULT` handler
- Accepts optional configuration for custom validation and normalization
- Returns a Promise that resolves after handling or rejects with non-HTTP errors

#### Scenario: Handle fetch error with status code handler

Given a failed fetch Response with status 404
When `errorHandler` is called with a 404 handler
Then the 404 handler is invoked with the normalized error data
And the DEFAULT handler is NOT invoked

```typescript
const response = new Response(null, { status: 404, statusText: 'Not Found' })

await errorHandler(response, {
  404: (data) => {
    // This handler is called
    expect(data).toBeDefined()
  },
  DEFAULT: (data) => {
    // This handler is NOT called
    fail('Should not call DEFAULT')
  }
})
```

#### Scenario: Handle fetch error without specific handler

Given a failed fetch Response with status 500
When `errorHandler` is called without a 500 handler
Then the DEFAULT handler is invoked with the normalized error data

```typescript
const response = new Response(null, { status: 500, statusText: 'Internal Server Error' })

await errorHandler(response, {
  DEFAULT: (data) => {
    // This handler is called
    expect(data).toBeDefined()
  }
})
```

#### Scenario: Reject non-HTTP errors

Given an error that is not a Response object
When `errorHandler` is called
Then the error is re-thrown

```typescript
const error = new Error('Network failure')

await expect(
  errorHandler(error, {
    DEFAULT: () => {}
  })
).rejects.toThrow('Network failure')
```

---

### Requirement: Fetch Error Validation

The system MUST provide a `validateError` function to identify fetch Response errors.

**Acceptance Criteria:**
- Function signature: `validateError(error: unknown): error is Response`
- Returns true if error is a Response object with `!ok` status
- Returns false for non-Response errors
- Acts as a TypeScript type guard

#### Scenario: Validate failed fetch Response

Given a Response object with status 400
When `validateError` is called
Then it returns true
And TypeScript narrows the type to Response

```typescript
const response = new Response(null, { status: 400 })

if (validateError(response)) {
  // TypeScript knows this is Response
  expect(response.status).toBe(400)
  expect(response.ok).toBe(false)
}
```

#### Scenario: Reject successful Response

Given a Response object with status 200
When `validateError` is called
Then it returns false

```typescript
const response = new Response(null, { status: 200 })
expect(validateError(response)).toBe(false)
```

#### Scenario: Reject non-Response errors

Given a standard Error object
When `validateError` is called
Then it returns false

```typescript
const error = new Error('Something went wrong')
expect(validateError(error)).toBe(false)
```

---

### Requirement: Fetch Error Normalization

The system MUST provide a `normalizeError` function to convert Response objects into standardized error objects.

**Acceptance Criteria:**
- Function signature: `normalizeError<T>(error: Response): Promise<NormalizedError<T>>`
- Extracts status code, status message, and body data
- Detects content-type and parses body accordingly (JSON or text)
- Handles body parsing failures gracefully (sets data to undefined)
- Handles already-consumed body (bodyUsed === true)
- Returns a NormalizedError object with all required fields

#### Scenario: Normalize Response with JSON body

Given a Response with status 400 and JSON content-type
And the body contains valid JSON
When `normalizeError` is called
Then it returns a NormalizedError with parsed JSON data

```typescript
const jsonData = { message: 'Validation failed', errors: ['email invalid'] }
const response = new Response(JSON.stringify(jsonData), {
  status: 400,
  statusText: 'Bad Request',
  headers: { 'content-type': 'application/json' }
})

const normalized = await normalizeError<typeof jsonData>(response)

expect(normalized.statusCode).toBe(400)
expect(normalized.statusMessage).toBe('Bad Request')
expect(normalized.data).toEqual(jsonData)
expect(normalized.name).toBe('FetchError')
```

#### Scenario: Normalize Response with text body

Given a Response with status 500 and text/plain content-type
When `normalizeError` is called
Then it returns a NormalizedError with text data

```typescript
const response = new Response('Internal server error occurred', {
  status: 500,
  statusText: 'Internal Server Error',
  headers: { 'content-type': 'text/plain' }
})

const normalized = await normalizeError<string>(response)

expect(normalized.statusCode).toBe(500)
expect(normalized.data).toBe('Internal server error occurred')
```

#### Scenario: Handle JSON parsing failure

Given a Response with JSON content-type
But the body is not valid JSON
When `normalizeError` is called
Then it returns a NormalizedError with undefined data
And does not throw an error

```typescript
const response = new Response('Not valid JSON', {
  status: 500,
  headers: { 'content-type': 'application/json' }
})

const normalized = await normalizeError(response)

expect(normalized.statusCode).toBe(500)
expect(normalized.data).toBeUndefined()
```

#### Scenario: Handle consumed body

Given a Response whose body has already been read
When `normalizeError` is called
Then it returns a NormalizedError with undefined data
And includes status code and message

```typescript
const response = new Response('{"error": "test"}', {
  status: 404,
  headers: { 'content-type': 'application/json' }
})

await response.json() // Consume the body

const normalized = await normalizeError(response)

expect(normalized.statusCode).toBe(404)
expect(normalized.data).toBeUndefined()
```

---

### Requirement: Handler Type Definitions

The system MUST provide type-safe handler definitions with mandatory DEFAULT handler.

**Acceptance Criteria:**
- `Handler<T>` type accepts normalized data and original error
- `HandlersWithDefault<T>` requires DEFAULT handler
- `HandlersWithDefault<T>` allows optional status code handlers
- Status code handlers use string literal types from StatusCodes enum
- TypeScript enforces DEFAULT handler presence at compile time

#### Scenario: Type-safe handler mapping

Given a HandlersWithDefault object
When TypeScript compiles the code
Then it enforces DEFAULT handler presence
And allows optional status code handlers
And provides type inference for handler parameters

```typescript
interface ApiError {
  code: string
  message: string
}

// ✓ Valid: has DEFAULT
const handlers1: HandlersWithDefault<ApiError> = {
  400: (data, error) => {
    // data is ApiError | undefined
    // error is unknown
  },
  DEFAULT: (data, error) => {}
}

// ✗ Invalid: missing DEFAULT
const handlers2: HandlersWithDefault<ApiError> = {
  400: (data) => {}
  // TypeScript error: Property 'DEFAULT' is missing
}
```

---

### Requirement: Normalized Error Structure

The system MUST define a standardized error structure for all HTTP errors.

**Acceptance Criteria:**
- Contains statusCode (number)
- Contains statusMessage (string)
- Contains message (string)
- Contains name (string, set to error type like 'FetchError')
- Contains optional data (generic type T)
- Contains optional cause (original error)
- Contains optional stack (string)

#### Scenario: Complete error information

Given any HTTP error
When normalized
Then it includes all required fields
And preserves original error as cause

```typescript
const response = new Response('{"detail": "not found"}', {
  status: 404,
  statusText: 'Not Found',
  headers: { 'content-type': 'application/json' }
})

const normalized = await normalizeError<{ detail: string }>(response)

expect(normalized).toMatchObject({
  statusCode: 404,
  statusMessage: 'Not Found',
  message: expect.stringContaining('404'),
  name: 'FetchError',
  data: { detail: 'not found' },
  cause: response,
  stack: expect.any(String)
})
```

---

### Requirement: Custom Validator and Normalizer Support

The system MUST allow custom validation and normalization functions via options.

**Acceptance Criteria:**
- `ErrorHandlerOptions<T>` accepts optional validateError function
- `ErrorHandlerOptions<T>` accepts optional normalizeError function
- Custom validators override default fetch validation
- Custom normalizers override default fetch normalization
- Enables support for other HTTP clients (axios, ofetch, etc.)

#### Scenario: Use custom validator and normalizer

Given a custom HTTP client error (e.g., AxiosError)
And custom validator and normalizer functions
When `errorHandler` is called with these options
Then the custom functions are used instead of defaults

```typescript
// Custom types (example for axios)
interface AxiosError {
  response?: {
    status: number
    statusText: string
    data: unknown
  }
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object'
    && error !== null
    && 'response' in error
  )
}

async function normalizeAxiosError<T>(error: AxiosError): Promise<NormalizedError<T>> {
  return {
    statusCode: error.response?.status ?? 500,
    statusMessage: error.response?.statusText ?? 'Unknown',
    message: `Axios Error ${error.response?.status}`,
    name: 'AxiosError',
    data: error.response?.data as T,
    cause: error
  }
}

// Usage
const axiosError: AxiosError = {
  response: {
    status: 401,
    statusText: 'Unauthorized',
    data: { message: 'Invalid token' }
  }
}

await errorHandler(axiosError, {
  401: (data) => {
    // Custom normalizer was used
    expect(data).toEqual({ message: 'Invalid token' })
  },
  DEFAULT: () => {}
}, {
  validateError: isAxiosError,
  normalizeError: normalizeAxiosError
})
```

---

### Requirement: Environment Compatibility

The system MUST work in both Node.js and browser environments.

**Acceptance Criteria:**
- Compatible with Node.js 18+ (native fetch support)
- Compatible with modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard Web APIs only (Response, Headers, etc.)
- No environment-specific dependencies
- Passes tests in both environments

#### Scenario: Node.js environment

Given the code runs in Node.js 18+
When using errorHandler with fetch
Then it works correctly with native fetch

```typescript
// In Node.js 18+
const response = await fetch('https://api.example.com/not-found')

if (!response.ok) {
  await errorHandler(response, {
    404: () => console.log('Not found'),
    DEFAULT: () => console.log('Error')
  })
}
```

#### Scenario: Browser environment

Given the code runs in a modern browser
When using errorHandler with fetch
Then it works correctly with browser fetch

```typescript
// In browser
const response = await fetch('/api/users')

if (!response.ok) {
  await errorHandler(response, {
    401: () => window.location.href = '/login',
    DEFAULT: () => alert('An error occurred')
  })
}
```

---

### Requirement: TypeScript Strict Mode Compliance

The system MUST compile and type-check under TypeScript strict mode.

**Acceptance Criteria:**
- Compiles with `strict: true`
- Compiles with `strictNullChecks: true`
- Compiles with `strictFunctionTypes: true`
- Compiles with `noImplicitAny: true`
- All exported types are properly defined
- No use of `any` without explicit justification

#### Scenario: Strict type checking

Given the library is imported in a strict TypeScript project
When the code is compiled
Then there are no type errors
And all type inference works correctly

```typescript
import type { HandlersWithDefault } from '@error-handling/core'
// This should compile without errors
import { errorHandler } from '@error-handling/core'

interface MyErrorData {
  error: string
  code: number
}

const handlers: HandlersWithDefault<MyErrorData> = {
  400: (data) => {
    // TypeScript knows data is MyErrorData | undefined
    if (data) {
      const code: number = data.code // ✓ Type-safe
      const msg: string = data.error // ✓ Type-safe
    }
  },
  DEFAULT: (data) => {
    // Same type inference
  }
}
```

---

## Implementation Notes

### File Structure

```
packages/core/src/
  errorHandler.ts          # Main API export
  validators/
    fetch.ts               # isFetchError function
  normalizers/
    fetch.ts               # normalizeFetchError function
  types/
    handler.ts             # Handler, HandlersWithDefault types (exists, may need updates)
    normalizedError.ts     # NormalizedError type (exists, may need updates)
    options.ts             # ErrorHandlerOptions type (exists, may need updates)
    statusCodes.ts         # StatusCodes enum (exists)
  index.ts                 # Public exports
```

### Key Design Decisions

1. **Async API**: `errorHandler` is async to handle Response body parsing
2. **DEFAULT Required**: Ensures all errors are handled, prevents silent failures
3. **Pluggable Functions**: Supports multiple HTTP clients via custom validators/normalizers
4. **Type Safety**: Full TypeScript support with strict mode compliance
5. **Error Re-throwing**: Non-HTTP errors are re-thrown to maintain error propagation chain

### Dependencies

- No runtime dependencies (uses Web standard APIs only)
- Dev dependencies: TypeScript, Vitest, type definitions

### Testing Requirements

- Unit tests for each function with edge cases
- Integration tests with real fetch calls
- Type tests using tsd or similar
- Cross-environment tests (Node.js + browser via Vitest)
