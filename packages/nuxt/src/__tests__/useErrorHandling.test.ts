import { errorHandler } from '@error-handling/core'
import { describe, expect, it, vi } from 'vitest'
import { useErrorHandling } from '../runtime/composables/useErrorHandling'

vi.mock('@error-handling/core', () => ({
  errorHandler: vi.fn(),
}))

describe('useErrorHandling', () => {
  it('should call errorHandler with correct arguments', () => {
    const handlers = { DEFAULT: vi.fn() }
    const { handleError } = useErrorHandling(handlers)
    const error = new Error('test')

    handleError(error)

    expect(errorHandler).toHaveBeenCalledWith(error, handlers, expect.objectContaining({
      validateError: expect.any(Function),
    }))
  })

  it('should merge overrideHandlers', () => {
    const handlers = { DEFAULT: vi.fn() }
    const overrideHandlers = { 404: vi.fn() }
    const { handleError } = useErrorHandling(handlers)
    const error = new Error('test')

    handleError(error, overrideHandlers)

    expect(errorHandler).toHaveBeenCalledWith(error, expect.objectContaining({
      ...handlers,
      ...overrideHandlers,
    }), expect.any(Object))
  })
})
