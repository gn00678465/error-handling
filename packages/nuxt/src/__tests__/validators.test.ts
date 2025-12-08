import { describe, expect, it } from 'vitest'
import { isFetchError, validateError } from '../runtime/utils/validators'

describe('validators', () => {
  describe('isFetchError', () => {
    it('should return true for valid fetch error', () => {
      const error = new Error('fetch error')
      Object.assign(error, { request: {}, options: {}, response: {} })
      expect(isFetchError(error)).toBe(true)
    })

    it('should return false for invalid error', () => {
      expect(isFetchError(new Error('test'))).toBe(false)
    })
  })

  describe('validateError', () => {
    it('should return true for fetch error', () => {
      const error = new Error('fetch error')
      Object.assign(error, { request: {}, options: {}, response: {} })
      expect(validateError(error)).toBe(true)
    })

    it('should return true for standard error', () => {
      expect(validateError(new Error('test'))).toBe(true)
    })

    it('should throw for invalid error', () => {
      expect(() => validateError('string error')).toThrow('string error')
    })
  })
})
