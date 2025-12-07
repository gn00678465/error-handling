# Implementation Tasks

This document outlines the implementation tasks for the `add-core-error-handler` change. Tasks should be completed in order, as later tasks may depend on earlier ones.

---

## Phase 1: Type Definitions (Foundation)

### Task 1.1: Review and Update Type Files
- [ ] Review `src/types/normalizedError.ts` and ensure it matches spec requirements
  - [ ] Verify `NormalizedError<T>` interface has all required fields
  - [ ] Add JSDoc comments for each field
  - [ ] Ensure `cause` and `stack` are optional
- [ ] Review `src/types/handler.ts` and update as needed
  - [ ] Ensure `Handler<T>` accepts `(data: T | undefined, error?: unknown) => void`
  - [ ] Update `HandlersWithDefault<T>` to require `DEFAULT` property
  - [ ] Remove or update `Handlers<T>` if needed
  - [ ] Add JSDoc comments
- [ ] Review or create `src/types/options.ts`
  - [ ] Define `ErrorHandlerOptions<T>` interface
  - [ ] Add optional `validateError` function property
  - [ ] Add optional `normalizeError` function property
  - [ ] Add JSDoc comments
- [ ] Verify `src/types/statusCodes.ts` is correct (should already exist)

**Validation:**
- TypeScript compiles without errors
- All types have complete JSDoc documentation

---

## Phase 2: Validator Implementation

### Task 2.1: Implement Fetch Error Validator
- [ ] Create `src/validators/fetch.ts`
- [ ] Implement `isFetchError(error: unknown): error is Response`
  - [ ] Check if error is instance of Response
  - [ ] Check if `!response.ok` (status >= 400)
  - [ ] Return boolean
  - [ ] Add JSDoc with examples
- [ ] Export validator from file

**Validation:**
- Unit tests pass:
  - Returns `true` for Response with status >= 400
  - Returns `false` for Response with status < 400
  - Returns `false` for non-Response objects
  - Type guard works correctly in TypeScript

---

## Phase 3: Normalizer Implementation

### Task 3.1: Implement Fetch Error Normalizer
- [ ] Create `src/normalizers/fetch.ts`
- [ ] Implement `normalizeFetchError<T>(error: Response): Promise<NormalizedError<T>>`
  - [ ] Check if `error.bodyUsed` is true
    - [ ] If true, return NormalizedError with `data: undefined`
  - [ ] Get content-type header
  - [ ] Parse body based on content-type:
    - [ ] If `application/json`, use `await error.json()`
    - [ ] Otherwise, use `await error.text()`
  - [ ] Wrap parsing in try-catch, set `data: undefined` on failure
  - [ ] Construct and return NormalizedError object:
    - [ ] Set `statusCode: error.status`
    - [ ] Set `statusMessage: error.statusText`
    - [ ] Set `message: "HTTP Error {status}: {statusText}"`
    - [ ] Set `name: 'FetchError'`
    - [ ] Set `data` from parsed body (or undefined)
    - [ ] Set `cause: error`
    - [ ] Set `stack: new Error().stack`
  - [ ] Add comprehensive JSDoc
- [ ] Export normalizer from file

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
- [ ] Create `src/errorHandler.ts`
- [ ] Import required types and default functions
- [ ] Implement `errorHandler<T>(error: unknown, handlers: HandlersWithDefault<T>, options?: ErrorHandlerOptions<T>): Promise<void>`
  - [ ] Extract or use default `validateError` from options
  - [ ] Extract or use default `normalizeError` from options
  - [ ] Call `validateError(error)`
    - [ ] If false, re-throw error
  - [ ] Call `await normalizeError(error)` to get NormalizedError
  - [ ] Check if `normalized.statusCode` exists and has a matching handler
    - [ ] Convert statusCode to string for handler lookup
    - [ ] If handler exists, call it with `(normalized.data, error)`
    - [ ] Return after calling specific handler
  - [ ] If no specific handler, call `handlers.DEFAULT(normalized.data, error)`
  - [ ] Add comprehensive JSDoc with usage examples
- [ ] Export errorHandler from file

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
- [ ] Update or create `src/index.ts`
- [ ] Export `errorHandler` function
- [ ] Export `isFetchError` from validators
- [ ] Export `normalizeFetchError` from normalizers
- [ ] Export all types:
  - [ ] `NormalizedError`
  - [ ] `Handler`
  - [ ] `HandlersWithDefault`
  - [ ] `ErrorHandlerOptions`
  - [ ] `StatusCodes` enum
  - [ ] `ErrorTransformCallback` (if still needed)
- [ ] Add file-level JSDoc describing the package

**Validation:**
- All exports are accessible from package root
- TypeScript declaration files (.d.ts) are generated correctly
- No internal implementation details are exported

---

## Phase 6: Package Configuration

### Task 6.1: Update Package.json
- [ ] Review `packages/core/package.json`
- [ ] Set correct `name`: `@error-handling/core`
- [ ] Set `version`: `0.1.0`
- [ ] Set `type`: `module`
- [ ] Configure `exports`:
  - [ ] Main export: `{ "types": "./dist/index.d.ts", "default": "./dist/index.js" }`
- [ ] Set `main`, `module`, `types` fields
- [ ] Add `files` field (include `dist/`)
- [ ] Verify `dependencies` (should be empty)
- [ ] Add build script: `"build": "tsdown src/index.ts"`
- [ ] Add test script: `"test": "vitest"`

**Validation:**
- Package.json is valid JSON
- Build script runs successfully
- Exports are correctly configured

---

## Phase 7: Build Configuration

### Task 7.1: Configure TypeScript Build
- [ ] Review or update `packages/core/tsconfig.json`
- [ ] Ensure `strict: true`
- [ ] Ensure `target: "ES2022"` (for Node 18+ and modern browsers)
- [ ] Ensure `module: "ESNext"`
- [ ] Set `moduleResolution: "Bundler"`
- [ ] Set `declaration: true`
- [ ] Set `declarationMap: true`
- [ ] Set `outDir: "./dist"`
- [ ] Include `src/**/*`
- [ ] Verify all strict flags are enabled

**Validation:**
- TypeScript compiles without errors or warnings
- Declaration files are generated in `dist/`

---

## Phase 8: Testing

### Task 8.1: Create Unit Tests
- [ ] Create `src/__tests__/validators/fetch.test.ts`
  - [ ] Test isFetchError with various inputs
  - [ ] Test type guard behavior
- [ ] Create `src/__tests__/normalizers/fetch.test.ts`
  - [ ] Test JSON response parsing
  - [ ] Test text response parsing
  - [ ] Test parse failures
  - [ ] Test bodyUsed scenario
  - [ ] Test all NormalizedError fields
- [ ] Create `src/__tests__/errorHandler.test.ts`
  - [ ] Test status code routing
  - [ ] Test DEFAULT handler fallback
  - [ ] Test error re-throwing
  - [ ] Test custom validators and normalizers
  - [ ] Test async behavior

**Validation:**
- All tests pass with `pnpm test`
- Code coverage > 90%

### Task 8.2: Create Integration Tests
- [ ] Create `src/__tests__/integration/fetch.test.ts`
  - [ ] Use mock fetch or MSW for realistic scenarios
  - [ ] Test complete error handling flow
  - [ ] Test with different content types
  - [ ] Test with various status codes
- [ ] Test in both Node.js and browser environments (if using Vitest with browser mode)

**Validation:**
- Integration tests pass
- Tests work in target environments

### Task 8.3: Create Type Tests
- [ ] Create `src/__tests__/types/handlers.test-d.ts` (using tsd or vitest)
  - [ ] Test HandlersWithDefault requires DEFAULT
  - [ ] Test type inference for handler parameters
  - [ ] Test StatusCodes string literal types
  - [ ] Test generic T propagation

**Validation:**
- Type tests pass
- Invalid usage produces TypeScript errors

---

## Phase 9: Documentation

### Task 9.1: Write API Documentation
- [ ] Create or update `packages/core/README.md`
  - [ ] Add package description
  - [ ] Add installation instructions
  - [ ] Add basic usage example (fetch)
  - [ ] Add advanced usage example (custom validator)
  - [ ] Document all exported functions and types
  - [ ] Add API reference
  - [ ] Add common patterns and best practices
- [ ] Ensure all JSDoc comments are complete and accurate

**Validation:**
- README is clear and comprehensive
- All examples are tested and working
- JSDoc generates proper documentation

### Task 9.2: Add Usage Examples
- [ ] Create `packages/core/examples/` directory
- [ ] Add `basic-fetch.ts` - simple fetch error handling
- [ ] Add `custom-validator.ts` - example with custom HTTP client
- [ ] Add `typed-errors.ts` - example with typed error data
- [ ] Ensure all examples run successfully

**Validation:**
- Examples compile and run without errors
- Examples demonstrate key features

---

## Phase 10: Quality Assurance

### Task 10.1: Linting and Formatting
- [ ] Run `pnpm lint` and fix all issues
- [ ] Ensure code follows project conventions (@antfu/eslint-config)
- [ ] Check for unused imports and variables
- [ ] Verify consistent naming conventions

**Validation:**
- `pnpm lint` passes with no warnings or errors

### Task 10.2: Build Verification
- [ ] Run `pnpm build` in packages/core
- [ ] Verify `dist/` directory structure
- [ ] Check generated `.d.ts` files
- [ ] Verify exports in built files
- [ ] Test importing from dist in a sample project

**Validation:**
- Build completes successfully
- All exports are available
- Types work correctly when imported

### Task 10.3: Final Testing
- [ ] Run full test suite: `pnpm test`
- [ ] Run tests in CI environment (if configured)
- [ ] Test in Node.js 18, 20, and latest
- [ ] Test in browser environments (if applicable)
- [ ] Verify no console errors or warnings

**Validation:**
- All tests pass in all environments
- No runtime errors or warnings

---

## Phase 11: Release Preparation

### Task 11.1: Pre-release Checklist
- [ ] Update CHANGELOG.md (if exists) or create it
- [ ] Verify package.json metadata (author, license, repository)
- [ ] Add keywords to package.json
- [ ] Review and update README badges (if any)
- [ ] Check for sensitive information in code
- [ ] Verify .npmignore or package.json files field

**Validation:**
- Package is ready for publishing
- No sensitive data included

### Task 11.2: Documentation Review
- [ ] Review all documentation for accuracy
- [ ] Check for broken links
- [ ] Verify code examples are up to date
- [ ] Ensure terminology is consistent
- [ ] Proofread for typos and grammar

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
