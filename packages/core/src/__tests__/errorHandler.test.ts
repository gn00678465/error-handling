import type { HandlersWithDefault } from '../types/handler'
import { describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../errorHandler'

describe('errorHandler', () => {
  it('should call specific handler if status code matches', async () => {
    const error = new Response(null, { status: 400 })
    const handlers: HandlersWithDefault = {
      400: vi.fn(),
      DEFAULT: vi.fn(),
    }

    await errorHandler(error, handlers)

    expect(handlers[400]).toHaveBeenCalled()
    expect(handlers.DEFAULT).not.toHaveBeenCalled()
  })

  it('should call DEFAULT handler if status code does not match', async () => {
    const error = new Response(null, { status: 500 })
    const handlers: HandlersWithDefault = {
      400: vi.fn(),
      DEFAULT: vi.fn(),
    }

    await errorHandler(error, handlers)

    expect(handlers[400]).not.toHaveBeenCalled()
    expect(handlers.DEFAULT).toHaveBeenCalled()
  })

  it('should re-throw if validation fails', async () => {
    const error = new Error('test')
    const handlers: HandlersWithDefault = {
      DEFAULT: vi.fn(),
    }

    await expect(errorHandler(error, handlers)).rejects.toThrow(error)
    expect(handlers.DEFAULT).not.toHaveBeenCalled()
  })

  it('should use custom validator', async () => {
    const error = new Error('test')
    const handlers: HandlersWithDefault = {
      DEFAULT: vi.fn(),
    }
    const validateError = vi.fn().mockReturnValue(true)
    const normalizeError = vi.fn().mockResolvedValue({
      message: 'test',
      name: 'Error',
    })

    await errorHandler(error, handlers, { validateError, normalizeError })

    expect(validateError).toHaveBeenCalledWith(error)
    expect(handlers.DEFAULT).toHaveBeenCalled()
  })
})
