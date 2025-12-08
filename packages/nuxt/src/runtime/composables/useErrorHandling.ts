import type { ErrorHandlerOptions, Handlers, HandlersWithDefault } from '@error-handling/core'
import { errorHandler } from '@error-handling/core'
import { normalizeError } from '../utils/normalizers'
import { validateError } from '../utils/validators'

export function useErrorHandling(
  handlers: HandlersWithDefault,
  options: ErrorHandlerOptions = {},
) {
  const _options: ErrorHandlerOptions = {
    validateError,
    normalizeError,
    ...options,
  }

  const handleError = (error: unknown, overrideHandlers?: Handlers) => {
    const mergedHandlers = overrideHandlers
      ? { ...handlers, ...overrideHandlers }
      : handlers

    return errorHandler(error, mergedHandlers, _options)
  }

  return {
    handleError,
  }
}
