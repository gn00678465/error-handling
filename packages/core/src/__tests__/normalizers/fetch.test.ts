import { describe, expect, it } from 'vitest'
import { normalizeFetchError } from '../../normalizers/fetch'

describe('normalizeFetchError', () => {
  it('should normalize JSON response', async () => {
    const data = { message: 'error' }
    const response = new Response(JSON.stringify(data), {
      status: 400,
      statusText: 'Bad Request',
      headers: { 'content-type': 'application/json' },
    })

    const normalized = await normalizeFetchError(response)

    expect(normalized).toEqual({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'HTTP Error 400: Bad Request',
      name: 'FetchError',
      data,
      cause: response,
      stack: expect.any(String),
    })
  })

  it('should normalize text response', async () => {
    const text = 'error message'
    const response = new Response(text, {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'content-type': 'text/plain' },
    })

    const normalized = await normalizeFetchError(response)

    expect(normalized).toEqual({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'HTTP Error 500: Internal Server Error',
      name: 'FetchError',
      data: text,
      cause: response,
      stack: expect.any(String),
    })
  })

  it('should handle body used', async () => {
    const response = new Response('test', { status: 400 })
    await response.text() // consume body

    const normalized = await normalizeFetchError(response)

    expect(normalized.data).toBeUndefined()
  })

  it('should handle parse error', async () => {
    const response = new Response('{invalid json}', {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })

    const normalized = await normalizeFetchError(response)

    expect(normalized.data).toBeUndefined()
  })

  it('should throw if error is not Response', async () => {
    await expect(normalizeFetchError({})).rejects.toThrow('Expected Response object')
  })
})
