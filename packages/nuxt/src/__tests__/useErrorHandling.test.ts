import { errorHandler } from '@error-handling/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useErrorHandling } from '../runtime/composables/useErrorHandling'

vi.mock('@error-handling/core', () => ({
  errorHandler: vi.fn(),
}))

describe('useErrorHandling', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call errorHandler with correct arguments', () => {
    const handlers = { DEFAULT: vi.fn() }
    const { handleError } = useErrorHandling(handlers)
    const error = new Error('test')

    handleError(error)

    expect(errorHandler).toHaveBeenCalledWith(error, handlers, expect.objectContaining({
      validateError: expect.any(Function),
      normalizeError: expect.any(Function),
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

  it('should use normalizeFetchError as default normalizer', () => {
    const handlers = { DEFAULT: vi.fn() }
    const { handleError } = useErrorHandling(handlers)
    const error = new Error('test')

    handleError(error)

    const callArgs = vi.mocked(errorHandler).mock.calls[0]
    expect(callArgs?.[2]).toHaveProperty('normalizeError')
    expect(callArgs?.[2]?.normalizeError).toBeTypeOf('function')
  })

  it('should allow custom normalizeError to override default', () => {
    const handlers = { DEFAULT: vi.fn() }
    const customNormalizer = vi.fn()
    const { handleError } = useErrorHandling(handlers, { normalizeError: customNormalizer })
    const error = new Error('test')

    handleError(error)

    const callArgs = vi.mocked(errorHandler).mock.calls[0]
    expect(callArgs?.[2]?.normalizeError).toBe(customNormalizer)
  })
})
