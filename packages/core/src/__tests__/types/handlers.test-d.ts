import type { Handler, HandlersWithDefault } from '../../types/handler'
import { describe, expectTypeOf, it } from 'vitest'

describe('handlersWithDefault', () => {
  it('should require DEFAULT handler', () => {
    expectTypeOf<HandlersWithDefault>().toMatchTypeOf<{ DEFAULT: Handler<unknown> }>()
  })

  it('should allow status code keys', () => {
    expectTypeOf<HandlersWithDefault>().toMatchTypeOf<{ 404?: Handler<unknown> }>()
    expectTypeOf<HandlersWithDefault>().toMatchTypeOf<{ 404?: Handler<unknown> }>()
  })

  it('should propagate generic type T', () => {
    interface ErrorData {
      code: string
    }
    expectTypeOf<HandlersWithDefault<ErrorData>>().toMatchTypeOf<{ DEFAULT: Handler<ErrorData> }>()
  })
})
