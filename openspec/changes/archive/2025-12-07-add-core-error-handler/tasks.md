# Implementation Tasks

This document outlines the implementation tasks for the `add-core-error-handler` change. Tasks should be completed in order, as later tasks may depend on earlier ones.

---

## Phase 1: Type Definitions (Foundation)

### Task 1.1: Review and Update Type Files
- [x] Review `src/types/normalizedError.ts` and ensure it matches spec requirements
  - [x] Verify `NormalizedError<T>` interface has all required fields
  - [x] Add JSDoc comments for each field
  - [x] Ensure `cause` and `stack` are optional
- [x] Review `src/types/handler.ts` and update as needed
  - [x] Ensure `Handler<T>` accepts `(data: T | undefined, error?: unknown) => void`
  - [x] Update `HandlersWithDefault<T>` to require `DEFAULT` property
  - [x] Remove or update `Handlers<T>` if needed
  - [x] Add JSDoc comments
- [x] Review or create `src/types/options.ts`
  - [x] Define `ErrorHandlerOptions<T>` interface
  - [x] Add optional `validateError` function property
  - [x] Add optional `normalizeError` function property
  - [x] Add JSDoc comments
- [x] Verify `src/types/statusCodes.ts` is correct (should already exist)

**Validation:**
- TypeScript compiles without errors
- All types have complete JSDoc documentation

---

## Phase 2: Validator Implementation

### Task 2.1: Implement Fetch Error Validator
- [x] Create `src/validators/fetch.ts`
- [x] Implement `isFetchError(error: unknown): error is Response`
  - [x] Check if error is instance of Response
  - [x] Check if `!response.ok` (status >= 400)
  - [x] Return boolean
  - [x] Add JSDoc with examples
- [x] Export validator from file

**Validation:**
- Unit tests pass:
  - Returns `true` for Response with status >= 400
  - Returns `false` for Response with status < 400
  - Returns `false` for non-Response objects
  - Type guard works correctly in TypeScript

---

## Phase 3: Normalizer Implementation

### Task 3.1: Implement Fetch Error Normalizer
- [x] Create `src/normalizers/fetch.ts`
- [x] Implement `normalizeFetchError<T>(error: Response): Promise<NormalizedError<T>>`
  - [x] Check if `error.bodyUsed` is true
    - [x] If true, return NormalizedError with `data: undefined`
  - [x] Get content-type header
  - [x] Parse body based on content-type:
    - [x] If `application/json`, use `await error.json()`
    - [x] Otherwise, use `await error.text()`
  - [x] Wrap parsing in try-catch, set `data: undefined` on failure
  - [x] Construct and return NormalizedError object:
    - [x] Set `statusCode: error.status`
    - [x] Set `statusMessage: error.statusText`
    - [x] Set `message: "HTTP Error {status}: {statusText}"`
    - [x] Set `name: 'FetchError'`
    - [x] Set `data` from parsed body (or undefined)
    - [x] Set `cause: error`
    - [x] Set `stack: new Error().stack`
  - [x] Add comprehensive JSDoc
- [x] Export normalizer from file

**Validation:**
- Unit tests pass:
  - Correctly parses JSON responses
  - Correctly parses text responses
  - Handles JSON parse failures gracefully
  - Handles consumed body (bodyUsed === true)
  - Returns all required NormalizedError fields
  - Preserves original Response as cause

---

## Phase 4: Core Error Handler

### Task 4.1: Implement Error Handler Function
- [x] Create `src/errorHandler.ts`
- [x] Import required types and default functions
- [x] Implement `errorHandler<T>(error: unknown, handlers: HandlersWithDefault<T>, options?: ErrorHandlerOptions<T>): Promise<void>`
  - [x] Extract or use default `validateError` from options
  - [x] Extract or use default `normalizeError` from options
  - [x] Call `validateError(error)`
    - [x] If false, re-throw error
  - [x] Call `await normalizeError(error)` to get NormalizedError
  - [x] Check if `normalized.statusCode` exists and has a matching handler
    - [x] Convert statusCode to string for handler lookup
    - [x] If handler exists, call it with `(normalized.data, error)`
    - [x] Return after calling specific handler
  - [x] If no specific handler, call `handlers.DEFAULT(normalized.data, error)`
  - [x] Add comprehensive JSDoc with usage examples
  - [x] Export errorHandler from file

**Validation:**
- Unit tests pass:
  - Calls specific status code handler when match exists
  - Calls DEFAULT handler when no match exists
  - Re-throws non-HTTP errors
  - Works with custom validators and normalizers
  - Passes correct parameters to handlers

---

## Phase 5: Public API and Exports

### Task 5.1: Create Public Exports
- [x] Update or create `src/index.ts`
- [x] Export `errorHandler` function
- [x] Export `isFetchError` from validators
- [x] Export `normalizeFetchError` from normalizers
- [x] Export all types:
  - [x] `NormalizedError`
  - [x] `Handler`
  - [x] `HandlersWithDefault`
  - [x] `ErrorHandlerOptions`
  - [x] `StatusCodes` enum
  - [x] `ErrorTransformCallback` (if still needed)
- [x] Add file-level JSDoc describing the package

**Validation:**
- All exports are accessible from package root
- TypeScript declaration files (.d.ts) are generated correctly
- No internal implementation details are exported

---

## Phase 6: Package Configuration

### Task 6.1: Update Package.json
- [x] Review `packages/core/package.json`
- [x] Set correct `name`: `@error-handling/core`
- [x] Set `version`: `0.1.0`
- [x] Set `type`: `module`
- [x] Configure `exports`:
  - [x] Main export: `{ "types": "./dist/index.d.ts", "default": "./dist/index.js" }`
- [x] Set `main`, `module`, `types` fields
- [x] Add `files` field (include `dist/`)
- [x] Verify `dependencies` (should be empty)
- [x] Add build script: `"build": "tsdown src/index.ts"`
- [x] Add test script: `"test": "vitest"`

**Validation:**
- Package.json is valid JSON
- Build script runs successfully
- Exports are correctly configured

---

## Phase 7: Build Configuration

### Task 7.1: Configure TypeScript Build
- [x] Review or update `packages/core/tsconfig.json`
- [x] Ensure `strict: true`
- [x] Ensure `target: "ES2022"` (for Node 18+ and modern browsers)
- [x] Ensure `module: "ESNext"`
- [x] Set `moduleResolution: "Bundler"`
- [x] Set `declaration: true`
- [x] Set `declarationMap: true`
- [x] Set `outDir: "./dist"`
- [x] Include `src/**/*`
- [x] Verify all strict flags are enabled

**Validation:**
- TypeScript compiles without errors or warnings
- Declaration files are generated in `dist/`

---

## Phase 8: Testing

### Task 8.1: Create Unit Tests
- [x] Create `src/__tests__/validators/fetch.test.ts`
  - [x] Test isFetchError with various inputs
  - [x] Test type guard behavior
- [x] Create `src/__tests__/normalizers/fetch.test.ts`
  - [x] Test JSON response parsing
  - [x] Test text response parsing
  - [x] Test parse failures
  - [x] Test bodyUsed scenario
  - [x] Test all NormalizedError fields
- [x] Create `src/__tests__/errorHandler.test.ts`
  - [x] Test status code routing
  - [x] Test DEFAULT handler fallback
  - [x] Test error re-throwing
  - [x] Test custom validators and normalizers
  - [x] Test async behavior

**Validation:**
- All tests pass with `pnpm test`
- Code coverage > 90%

### Task 8.2: Create Integration Tests
- [x] Create `src/__tests__/integration/fetch.test.ts`
  - [x] Use mock fetch or MSW for realistic scenarios
  - [x] Test complete error handling flow
  - [x] Test with different content types
  - [x] Test with various status codes
- [x] Test in both Node.js and browser environments (if using Vitest with browser mode)

**Validation:**
- Integration tests pass
- Tests work in target environments

### Task 8.3: Create Type Tests
- [x] Create `src/__tests__/types/handlers.test-d.ts` (using tsd or vitest)
  - [x] Test HandlersWithDefault requires DEFAULT
  - [x] Test type inference for handler parameters
  - [x] Test StatusCodes string literal types
  - [x] Test generic T propagation

**Validation:**
- Type tests pass
- Invalid usage produces TypeScript errors

---

## Phase 9: Documentation

### Task 9.1: Write API Documentation
- [x] Create or update `packages/core/README.md`
  - [x] Add package description
  - [x] Add installation instructions
  - [x] Add basic usage example (fetch)
  - [x] Add advanced usage example (custom validator)
  - [x] Document all exported functions and types
  - [x] Add API reference
  - [x] Add common patterns and best practices
- [x] Ensure all JSDoc comments are complete and accurate

**Validation:**
- README is clear and comprehensive
- All examples are tested and working
- JSDoc generates proper documentation

### Task 9.2: Add Usage Examples
- [x] Create `packages/core/examples/` directory
- [x] Add `basic-fetch.ts` - simple fetch error handling
- [x] Add `custom-validator.ts` - example with custom HTTP client
- [x] Add `typed-errors.ts` - example with typed error data
- [x] Ensure all examples run successfully

**Validation:**
- Examples compile and run without errors
- Examples demonstrate key features

---

## Phase 10: Quality Assurance

### Task 10.1: Linting and Formatting
- [x] Run `pnpm lint` and fix all issues
- [x] Ensure code follows project conventions (@antfu/eslint-config)
- [x] Check for unused imports and variables
- [x] Verify consistent naming conventions

**Validation:**
- `pnpm lint` passes with no warnings or errors

### Task 10.2: Build Verification
- [x] Run `pnpm build` in packages/core
- [x] Verify `dist/` directory structure
- [x] Check generated `.d.ts` files
- [x] Verify exports in built files
- [x] Test importing from dist in a sample project

**Validation:**
- Build completes successfully
- All exports are available
- Types work correctly when imported

### Task 10.3: Final Testing
- [x] Run full test suite: `pnpm test`
- [x] Run tests in CI environment (if configured)
- [x] Test in Node.js 18, 20, and latest
- [x] Test in browser environments (if applicable)
- [x] Verify no console errors or warnings

**Validation:**
- All tests pass in all environments
- No runtime errors or warnings

---

## Phase 11: Release Preparation

### Task 11.1: Pre-release Checklist
- [x] Update CHANGELOG.md (if exists) or create it
- [x] Verify package.json metadata (author, license, repository)
- [x] Add keywords to package.json
- [x] Review and update README badges (if any)
- [x] Check for sensitive information in code
- [x] Verify .npmignore or package.json files field

**Validation:**
- Package is ready for publishing
- No sensitive data included

### Task 11.2: Documentation Review
- [x] Review all documentation for accuracy
- [x] Check for broken links
- [x] Verify code examples are up to date
- [x] Ensure terminology is consistent
- [x] Proofread for typos and grammar

**Validation:**
- Documentation is professional and accurate
- Examples work as documented

---

## Dependencies and Parallelization

### Can be parallelized:
- After Phase 1: Tasks 2.1 and 3.1 can run in parallel
- Phase 8.1, 8.2, 8.3 can run in parallel (after Phase 7)
- Phase 9.1 and 9.2 can run in parallel (after Phase 5)

### Must be sequential:
- Phase 1 → Phase 2, 3
- Phase 2, 3 → Phase 4
- Phase 4 → Phase 5
- Phase 5 → Phase 6, 7
- Phase 6, 7 → Phase 8
- Phase 8 → Phase 9
- Phase 9 → Phase 10
- Phase 10 → Phase 11

---

## Success Criteria

Implementation is complete when:
1. ✅ All tasks are checked off
2. ✅ All tests pass (unit, integration, type tests)
3. ✅ Linting passes with no errors
4. ✅ Build succeeds and generates correct artifacts
5. ✅ Documentation is complete and accurate
6. ✅ Examples run successfully
7. ✅ Package is ready for publishing
8. ✅ Spec requirements (REQ-CORE-001 through REQ-CORE-008) are met

---

## Notes

- Commit regularly after completing each task or logical group of tasks
- Run tests frequently during development, not just at the end
- Update this checklist as you complete tasks
- If you discover missing requirements during implementation, update the spec first
- Keep the design document synchronized with any architectural decisions made during implementation
