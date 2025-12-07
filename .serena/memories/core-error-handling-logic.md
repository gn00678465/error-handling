# Core Error Handling Logic

## Overview
`@error-handling/core` standardizes HTTP error handling, defaulting to native `fetch` but extensible for other clients.

## Core Flow (`errorHandler`)
1.  **Input**: `error`, `handlers` (map), `options`.
2.  **Validation**: `validateError(error)` (default: `isFetchError`). Returns `false` -> re-throw.
3.  **Normalization**: `normalizeError(error)` (default: `normalizeFetchError`). Returns `NormalizedError<T>`.
4.  **Routing**: Uses `statusCode` from normalized error to find a handler.
5.  **Execution**: Calls specific handler if found, else `DEFAULT`.

## Components
### Validator (`src/validators/`)
*   `isFetchError`: Checks `error instanceof Response` and `!response.ok`.

### Normalizer (`src/normalizers/`)
*   `normalizeFetchError`:
    *   Parses body based on `Content-Type` (JSON/Text).
    *   Handles `bodyUsed`.
    *   Returns `NormalizedError` with `statusCode`, `message`, `data`.

### Types (`src/types/`)
*   `NormalizedError<T>`: Standard error interface.
*   `HandlersWithDefault<T>`: Ensures `DEFAULT` handler exists.

## Extensibility
Override `validateError` and `normalizeError` in `options` to support Axios, ofetch, etc.
