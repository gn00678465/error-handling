import type { HandlersWithDefault } from '../../types/handler'
import { describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../errorHandler'

describe('integration: Fetch Error Handling', () => {
  it('should handle 404 Not Found', async () => {
    const response = new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      statusText: 'Not Found',
      headers: { 'content-type': 'application/json' },
    })

    const handle404 = vi.fn()
    const handleDefault = vi.fn()

    const handlers: HandlersWithDefault = {
      404: handle404,
      DEFAULT: handleDefault,
    }

    await errorHandler(response, handlers)

    expect(handle404).toHaveBeenCalledWith(
      { error: 'Not Found' },
      response,
    )
    expect(handleDefault).not.toHaveBeenCalled()
  })

  it('should handle 500 Internal Server Error with text body', async () => {
    const response = new Response('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'content-type': 'text/plain' },
    })

    const handle500 = vi.fn()
    const handleDefault = vi.fn()

    const handlers: HandlersWithDefault = {
      500: handle500,
      DEFAULT: handleDefault,
    }

    await errorHandler(response, handlers)

    expect(handle500).toHaveBeenCalledWith(
      'Server Error',
      response,
    )
  })

  it('should fallback to DEFAULT handler for unhandled status', async () => {
    const response = new Response(null, { status: 418 })
    const handleDefault = vi.fn()

    const handlers: HandlersWithDefault = {
      DEFAULT: handleDefault,
    }

    await errorHandler(response, handlers)

    expect(handleDefault).toHaveBeenCalledWith(
      undefined,
      response,
    )
  })
})
