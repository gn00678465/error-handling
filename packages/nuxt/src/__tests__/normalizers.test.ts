import { describe, expect, it } from 'vitest'
import { normalizeError, normalizeFetchError, normalizeNuxtError } from '../runtime/utils/normalizers'

// Mock NuxtError 介面以供測試使用
interface MockNuxtError<T = unknown> extends Error {
  statusCode: number
  statusMessage?: string
  data?: T
  cause?: unknown
  __nuxt_error?: boolean
}

function createMockNuxtError<T = unknown>(options: {
  statusCode: number
  statusMessage?: string
  message: string
  data?: T
  cause?: unknown
}): MockNuxtError<T> {
  const error = new Error(options.message) as MockNuxtError<T>
  error.statusCode = options.statusCode
  error.statusMessage = options.statusMessage
  error.data = options.data
  error.cause = options.cause
  error.__nuxt_error = true // Nuxt 用這個標記來識別 NuxtError
  return error
}

describe('normalizeFetchError', () => {
  it('應該拋出 TypeError 如果傳入的不是 FetchError', () => {
    const error = new Error('Not a FetchError')
    expect(() => normalizeFetchError(error)).toThrow('Expected FetchError object')
  })

  it('應該標準化包含完整資訊的 FetchError', () => {
    const fetchError = Object.assign(new Error('Fetch failed'), {
      request: 'https://api.example.com',
      options: {},
      response: {
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        ok: false,
        _data: { error: 'Resource not found' },
      },
      data: { error: 'Resource not found' },
      status: 404,
      statusCode: 404,
      statusText: 'Not Found',
      statusMessage: 'Not Found',
    })

    const result = normalizeFetchError(fetchError)

    expect(result).toEqual({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Fetch failed',
      name: 'Error',
      data: { error: 'Resource not found' },
      cause: fetchError,
      stack: fetchError.stack,
    })
  })

  it('應該使用 statusCode 如果 status 不存在', () => {
    const fetchError = Object.assign(new Error('Server error'), {
      request: 'https://api.example.com',
      options: {},
      response: undefined,
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })

    const result = normalizeFetchError(fetchError)

    expect(result.statusCode).toBe(500)
    expect(result.statusMessage).toBe('Internal Server Error')
  })

  it('應該使用 status 如果 statusCode 不存在', () => {
    const fetchError = Object.assign(new Error('Bad request'), {
      request: 'https://api.example.com',
      options: {},
      status: 400,
      statusText: 'Bad Request',
    })

    const result = normalizeFetchError(fetchError)

    expect(result.statusCode).toBe(400)
    expect(result.statusMessage).toBe('Bad Request')
  })

  it('應該優先使用 statusMessage 而非 statusText', () => {
    const fetchError = Object.assign(new Error('Error'), {
      request: 'https://api.example.com',
      options: {},
      status: 403,
      statusText: 'Forbidden',
      statusMessage: '禁止訪問',
    })

    const result = normalizeFetchError(fetchError)

    expect(result.statusMessage).toBe('禁止訪問')
  })

  it('應該從 response._data 取得資料如果 data 不存在', () => {
    const fetchError = Object.assign(new Error('Error'), {
      request: 'https://api.example.com',
      options: {},
      response: {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: new Headers(),
        ok: false,
        _data: { validation: 'failed' },
      },
      status: 422,
    })

    const result = normalizeFetchError(fetchError)

    expect(result.data).toEqual({ validation: 'failed' })
  })

  it('應該優先使用 data 而非 response._data', () => {
    const fetchError = Object.assign(new Error('Error'), {
      request: 'https://api.example.com',
      options: {},
      response: {
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers(),
        ok: false,
        _data: { old: 'data' },
      },
      data: { new: 'data' },
      status: 400,
    })

    const result = normalizeFetchError(fetchError)

    expect(result.data).toEqual({ new: 'data' })
  })

  it('應該處理沒有 statusCode 和 status 的情況', () => {
    const fetchError = Object.assign(new Error('Network error'), {
      request: 'https://api.example.com',
      options: {},
      response: undefined,
    })

    const result = normalizeFetchError(fetchError)

    expect(result.statusCode).toBeUndefined()
    expect(result.message).toBe('Network error')
  })

  it('應該使用預設錯誤名稱如果 name 不存在', () => {
    const fetchError = Object.assign(new Error('Error'), {
      request: 'https://api.example.com',
      options: {},
      status: 500,
    })
    // 移除 name 屬性
    Object.defineProperty(fetchError, 'name', { value: undefined })

    const result = normalizeFetchError(fetchError)

    expect(result.name).toBe('FetchError')
  })

  it('應該建立預設訊息如果 message 不存在但有 statusCode', () => {
    const fetchError = Object.assign(new Error('Initial message'), {
      request: 'https://api.example.com',
      options: {},
      status: 503,
    })
    // 移除 message
    Object.defineProperty(fetchError, 'message', { value: '' })

    const result = normalizeFetchError(fetchError)

    expect(result.message).toBe('HTTP Error 503')
  })

  it('應該建立預設訊息如果沒有 message 和 statusCode', () => {
    const fetchError = Object.assign(new Error('Initial message'), {
      request: 'https://api.example.com',
      options: {},
      response: undefined,
    })
    // 移除 message
    Object.defineProperty(fetchError, 'message', { value: '' })

    const result = normalizeFetchError(fetchError)

    expect(result.message).toBe('Fetch Error')
  })

  it('應該保留 stack trace', () => {
    const fetchError = Object.assign(new Error('Error with stack'), {
      request: 'https://api.example.com',
      options: {},
      status: 500,
    })

    const result = normalizeFetchError(fetchError)

    expect(result.stack).toBe(fetchError.stack)
  })
})

describe('normalizeNuxtError', () => {
  it('應該拋出 TypeError 如果傳入的不是 NuxtError', () => {
    const error = new Error('Not a NuxtError')
    expect(() => normalizeNuxtError(error)).toThrow('Expected NuxtError object')
  })

  it('應該標準化包含完整資訊的 NuxtError', () => {
    const nuxtError = createMockNuxtError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      message: 'The requested page does not exist',
      data: { path: '/unknown' },
    })

    const result = normalizeNuxtError(nuxtError)

    expect(result).toEqual({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      message: 'The requested page does not exist',
      name: 'Error',
      data: { path: '/unknown' },
      cause: nuxtError,
      stack: nuxtError.stack,
    })
  })

  it('應該處理沒有 data 的 NuxtError', () => {
    const nuxtError = createMockNuxtError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Something went wrong',
    })

    const result = normalizeNuxtError(nuxtError)

    expect(result.statusCode).toBe(500)
    expect(result.statusMessage).toBe('Internal Server Error')
    expect(result.message).toBe('Something went wrong')
    expect(result.data).toBeUndefined()
  })

  it('應該使用預設 name 如果 name 不存在', () => {
    const nuxtError = createMockNuxtError({
      statusCode: 403,
      message: 'Forbidden',
    })
    // 移除 name 屬性
    Object.defineProperty(nuxtError, 'name', { value: undefined, configurable: true })

    const result = normalizeNuxtError(nuxtError)

    expect(result.name).toBe('NuxtError')
  })

  it('應該使用 cause 如果存在', () => {
    const originalError = new Error('Original error')
    const nuxtError = createMockNuxtError({
      statusCode: 500,
      message: 'Wrapped error',
      cause: originalError,
    })

    const result = normalizeNuxtError(nuxtError)

    expect(result.cause).toBe(originalError)
  })

  it('應該使用 error 本身作為 cause 如果沒有 cause 屬性', () => {
    const nuxtError = createMockNuxtError({
      statusCode: 400,
      message: 'Bad Request',
    })

    const result = normalizeNuxtError(nuxtError)

    expect(result.cause).toBe(nuxtError)
  })

  it('應該保留 stack trace', () => {
    const nuxtError = createMockNuxtError({
      statusCode: 500,
      message: 'Error with stack',
    })

    const result = normalizeNuxtError(nuxtError)

    expect(result.stack).toBe(nuxtError.stack)
    expect(result.stack).toBeDefined()
  })

  it('應該正確處理泛型資料型別', () => {
    interface CustomData {
      userId: number
      action: string
    }

    const nuxtError = createMockNuxtError({
      statusCode: 422,
      message: 'Validation failed',
      data: { userId: 123, action: 'update' },
    })

    const result = normalizeNuxtError<CustomData>(nuxtError)

    expect(result.data).toEqual({ userId: 123, action: 'update' })
    expect(result.data?.userId).toBe(123)
  })
})

describe('normalizeError', () => {
  it('應該拋出 TypeError 如果傳入的既不是 NuxtError 也不是 FetchError', () => {
    const error = new Error('Generic error')
    expect(() => normalizeError(error)).toThrow('Expected NuxtError or FetchError object')
  })

  it('應該優先處理 NuxtError', () => {
    const nuxtError = createMockNuxtError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Resource not found',
    })

    const result = normalizeError(nuxtError)

    expect(result.statusCode).toBe(404)
    expect(result.name).toBe('Error')
    expect(result.message).toBe('Resource not found')
  })

  it('應該處理 FetchError', () => {
    const fetchError = Object.assign(new Error('Fetch failed'), {
      request: 'https://api.example.com',
      options: {},
      status: 500,
      statusText: 'Internal Server Error',
    })

    const result = normalizeError(fetchError)

    expect(result.statusCode).toBe(500)
    expect(result.name).toBe('Error')
    expect(result.message).toBe('Fetch failed')
  })

  it('應該正確委派給 normalizeNuxtError', () => {
    const nuxtError = createMockNuxtError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required',
      data: { requiresAuth: true },
    })

    const result = normalizeError(nuxtError)

    expect(result).toEqual({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required',
      name: 'Error',
      data: { requiresAuth: true },
      cause: nuxtError,
      stack: nuxtError.stack,
    })
  })

  it('應該正確委派給 normalizeFetchError', () => {
    const fetchError = Object.assign(new Error('Network error'), {
      request: 'https://api.example.com',
      options: {},
      response: {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers(),
        ok: false,
      },
      status: 503,
      statusMessage: 'Service Unavailable',
    })

    const result = normalizeError(fetchError)

    expect(result).toEqual({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'Network error',
      name: 'Error',
      data: undefined,
      cause: fetchError,
      stack: fetchError.stack,
    })
  })

  it('應該處理帶有泛型的 NuxtError', () => {
    interface ApiResponse {
      success: boolean
      errors: string[]
    }

    const nuxtError = createMockNuxtError({
      statusCode: 400,
      message: 'Validation error',
      data: { success: false, errors: ['Invalid email', 'Password too short'] },
    })

    const result = normalizeError<ApiResponse>(nuxtError)

    expect(result.data?.success).toBe(false)
    expect(result.data?.errors).toHaveLength(2)
  })

  it('應該處理帶有泛型的 FetchError', () => {
    interface UserData {
      id: number
      name: string
    }

    const fetchError = Object.assign(new Error('User fetch failed'), {
      request: 'https://api.example.com/users/1',
      options: {},
      data: { id: 1, name: 'John Doe' },
      status: 200,
    })

    const result = normalizeError<UserData>(fetchError)

    expect(result.data?.id).toBe(1)
    expect(result.data?.name).toBe('John Doe')
  })
})
