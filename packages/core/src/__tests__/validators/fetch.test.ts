import { describe, expect, it } from 'vitest'
import { isFetchError } from '../../validators/fetch'

describe('isFetchError', () => {
  it('should return true for Response object with status >= 400', () => {
    const response = new Response(null, { status: 400 })
    expect(isFetchError(response)).toBe(true)
  })

  it('should return true for Response object with status 500', () => {
    const response = new Response(null, { status: 500 })
    expect(isFetchError(response)).toBe(true)
  })

  it('should return false for Response object with status 200', () => {
    const response = new Response(null, { status: 200 })
    expect(isFetchError(response)).toBe(false)
  })

  it('should return false for non-Response object', () => {
    expect(isFetchError({})).toBe(false)
    expect(isFetchError(new Error('test'))).toBe(false)
    expect(isFetchError(null)).toBe(false)
    expect(isFetchError(undefined)).toBe(false)
  })
})
