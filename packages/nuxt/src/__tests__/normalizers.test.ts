import { describe, expect, it } from 'vitest'
import { normalizeFetchError } from '../runtime/utils/normalizers'

describe('normalizeFetchError', () => {
  it('應該拋出 TypeError 如果傳入的不是 FetchError', async () => {
    const error = new Error('Not a FetchError')
    await expect(normalizeFetchError(error)).rejects.toThrow('Expected FetchError object')
  })

  it('應該標準化包含完整資訊的 FetchError', async () => {
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

    const result = await normalizeFetchError(fetchError)

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

  it('應該使用 statusCode 如果 status 不存在', async () => {
    const fetchError = Object.assign(new Error('Server error'), {
      request: 'https://api.example.com',
      options: {},
      response: undefined,
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })

    const result = await normalizeFetchError(fetchError)

    expect(result.statusCode).toBe(500)
    expect(result.statusMessage).toBe('Internal Server Error')
  })

  it('應該使用 status 如果 statusCode 不存在', async () => {
    const fetchError = Object.assign(new Error('Bad request'), {
      request: 'https://api.example.com',
      options: {},
      status: 400,
      statusText: 'Bad Request',
    })

    const result = await normalizeFetchError(fetchError)

    expect(result.statusCode).toBe(400)
    expect(result.statusMessage).toBe('Bad Request')
  })

  it('應該優先使用 statusMessage 而非 statusText', async () => {
    const fetchError = Object.assign(new Error('Error'), {
      request: 'https://api.example.com',
      options: {},
      status: 403,
      statusText: 'Forbidden',
      statusMessage: '禁止訪問',
    })

    const result = await normalizeFetchError(fetchError)

    expect(result.statusMessage).toBe('禁止訪問')
  })

  it('應該從 response._data 取得資料如果 data 不存在', async () => {
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

    const result = await normalizeFetchError(fetchError)

    expect(result.data).toEqual({ validation: 'failed' })
  })

  it('應該優先使用 data 而非 response._data', async () => {
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

    const result = await normalizeFetchError(fetchError)

    expect(result.data).toEqual({ new: 'data' })
  })

  it('應該處理沒有 statusCode 和 status 的情況', async () => {
    const fetchError = Object.assign(new Error('Network error'), {
      request: 'https://api.example.com',
      options: {},
      response: undefined,
    })

    const result = await normalizeFetchError(fetchError)

    expect(result.statusCode).toBeUndefined()
    expect(result.message).toBe('Network error')
  })

  it('應該使用預設錯誤名稱如果 name 不存在', async () => {
    const fetchError = Object.assign(new Error('Error'), {
      request: 'https://api.example.com',
      options: {},
      status: 500,
    })
    // 移除 name 屬性
    Object.defineProperty(fetchError, 'name', { value: undefined })

    const result = await normalizeFetchError(fetchError)

    expect(result.name).toBe('FetchError')
  })

  it('應該建立預設訊息如果 message 不存在但有 statusCode', async () => {
    const fetchError = Object.assign(new Error('Initial message'), {
      request: 'https://api.example.com',
      options: {},
      status: 503,
    })
    // 移除 message
    Object.defineProperty(fetchError, 'message', { value: '' })

    const result = await normalizeFetchError(fetchError)

    expect(result.message).toBe('HTTP Error 503')
  })

  it('應該建立預設訊息如果沒有 message 和 statusCode', async () => {
    const fetchError = Object.assign(new Error('Initial message'), {
      request: 'https://api.example.com',
      options: {},
      response: undefined,
    })
    // 移除 message
    Object.defineProperty(fetchError, 'message', { value: '' })

    const result = await normalizeFetchError(fetchError)

    expect(result.message).toBe('Fetch Error')
  })

  it('應該保留 stack trace', async () => {
    const fetchError = Object.assign(new Error('Error with stack'), {
      request: 'https://api.example.com',
      options: {},
      status: 500,
    })

    const result = await normalizeFetchError(fetchError)

    expect(result.stack).toBe(fetchError.stack)
  })
})
