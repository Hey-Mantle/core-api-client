import { describe, it, expect, vi } from 'vitest'
import { MiddlewareManager } from '../../src/middleware/manager'
import type { MiddlewareContext, MiddlewareResponse } from '../../src/middleware/types'

function createMockContext<T = unknown>(
  overrides: Partial<MiddlewareContext<T>> = {}
): MiddlewareContext<T> {
  return {
    request: {
      url: 'https://api.example.com/test',
      method: 'GET',
      headers: {},
      endpoint: '/test',
    },
    retry: false,
    retryCount: 0,
    maxRetries: 3,
    updateAuth: vi.fn(),
    ...overrides,
  }
}

function createMockResponse<T = unknown>(data: T): MiddlewareResponse<T> {
  return {
    data,
    status: 200,
    headers: new Headers(),
  }
}

describe('MiddlewareManager', () => {
  describe('use', () => {
    it('returns this for chaining', () => {
      const manager = new MiddlewareManager()
      const result = manager.use(async (_ctx, next) => {
        await next()
      })

      expect(result).toBe(manager)
    })

    it('adds middleware', () => {
      const manager = new MiddlewareManager()
      manager.use(async (_ctx, next) => {
        await next()
      })

      expect(manager.hasMiddleware()).toBe(true)
    })

    it('generates unique name when not provided', () => {
      const manager = new MiddlewareManager()
      manager.use(async (_ctx, next) => {
        await next()
      })
      manager.use(async (_ctx, next) => {
        await next()
      })

      const names = manager.list()
      expect(names).toHaveLength(2)
      expect(names[0]).not.toBe(names[1])
    })

    it('uses provided name', () => {
      const manager = new MiddlewareManager()
      manager.use(
        async (_ctx, next) => {
          await next()
        },
        { name: 'my-middleware' }
      )

      expect(manager.list()).toContain('my-middleware')
    })

    it('sorts middleware by priority (lowest first)', () => {
      const manager = new MiddlewareManager()
      const order: number[] = []

      manager.use(
        async (_ctx, next) => {
          order.push(3)
          await next()
        },
        { name: 'low', priority: 200 }
      )
      manager.use(
        async (_ctx, next) => {
          order.push(1)
          await next()
        },
        { name: 'high', priority: 50 }
      )
      manager.use(
        async (_ctx, next) => {
          order.push(2)
          await next()
        },
        { name: 'medium', priority: 100 }
      )

      const names = manager.list()
      expect(names).toEqual(['high', 'medium', 'low'])
    })
  })

  describe('remove', () => {
    it('returns true when middleware is removed', () => {
      const manager = new MiddlewareManager()
      manager.use(
        async (_ctx, next) => {
          await next()
        },
        { name: 'test' }
      )

      expect(manager.remove('test')).toBe(true)
      expect(manager.hasMiddleware()).toBe(false)
    })

    it('returns false when middleware is not found', () => {
      const manager = new MiddlewareManager()

      expect(manager.remove('non-existent')).toBe(false)
    })
  })

  describe('list', () => {
    it('returns empty array when no middleware', () => {
      const manager = new MiddlewareManager()

      expect(manager.list()).toEqual([])
    })

    it('returns middleware names in priority order', () => {
      const manager = new MiddlewareManager()
      manager.use(
        async (_ctx, next) => {
          await next()
        },
        { name: 'second', priority: 100 }
      )
      manager.use(
        async (_ctx, next) => {
          await next()
        },
        { name: 'first', priority: 50 }
      )

      expect(manager.list()).toEqual(['first', 'second'])
    })
  })

  describe('hasMiddleware', () => {
    it('returns false when no middleware', () => {
      const manager = new MiddlewareManager()

      expect(manager.hasMiddleware()).toBe(false)
    })

    it('returns true when middleware is registered', () => {
      const manager = new MiddlewareManager()
      manager.use(async (_ctx, next) => {
        await next()
      })

      expect(manager.hasMiddleware()).toBe(true)
    })
  })

  describe('execute', () => {
    it('calls core handler and returns response', async () => {
      const manager = new MiddlewareManager()
      const ctx = createMockContext()
      const coreHandler = vi.fn().mockResolvedValue(createMockResponse({ data: 'test' }))

      const response = await manager.execute(ctx, coreHandler)

      expect(coreHandler).toHaveBeenCalled()
      expect(response.data).toEqual({ data: 'test' })
    })

    it('executes middleware in order', async () => {
      const manager = new MiddlewareManager()
      const order: string[] = []

      manager.use(
        async (_ctx, next) => {
          order.push('first-before')
          await next()
          order.push('first-after')
        },
        { priority: 50 }
      )
      manager.use(
        async (_ctx, next) => {
          order.push('second-before')
          await next()
          order.push('second-after')
        },
        { priority: 100 }
      )

      const ctx = createMockContext()
      await manager.execute(ctx, async () => {
        order.push('core')
        return createMockResponse({})
      })

      expect(order).toEqual([
        'first-before',
        'second-before',
        'core',
        'second-after',
        'first-after',
      ])
    })

    it('middleware receives context', async () => {
      const manager = new MiddlewareManager()
      let capturedCtx: MiddlewareContext | undefined

      manager.use(async (ctx, next) => {
        capturedCtx = ctx
        await next()
      })

      const ctx = createMockContext()
      await manager.execute(ctx, async () => createMockResponse({}))

      expect(capturedCtx).toBe(ctx)
    })

    it('middleware can access response after next()', async () => {
      const manager = new MiddlewareManager()
      let responseData: unknown

      manager.use(async (ctx, next) => {
        await next()
        responseData = ctx.response?.data
      })

      const ctx = createMockContext()
      await manager.execute(ctx, async () => createMockResponse({ result: 'success' }))

      expect(responseData).toEqual({ result: 'success' })
    })

    it('sets ctx.error when core handler throws', async () => {
      const manager = new MiddlewareManager()
      const error = new Error('Core error')
      let capturedError: Error | undefined

      manager.use(async (ctx, next) => {
        try {
          await next()
        } catch {
          capturedError = ctx.error
          throw ctx.error
        }
      })

      const ctx = createMockContext()
      await expect(
        manager.execute(ctx, async () => {
          throw error
        })
      ).rejects.toThrow('Core error')

      expect(capturedError).toBe(error)
    })

    it('throws when next() is called multiple times', async () => {
      const manager = new MiddlewareManager()

      manager.use(async (_ctx, next) => {
        await next()
        await next() // Second call should throw
      })

      const ctx = createMockContext()
      await expect(
        manager.execute(ctx, async () => createMockResponse({}))
      ).rejects.toThrow('next() called multiple times')
    })

    describe('retry support', () => {
      it('retries when ctx.retry is set to true', async () => {
        const manager = new MiddlewareManager()
        let attempts = 0

        manager.use(async (ctx, next) => {
          attempts++
          await next()
          if (attempts === 1) {
            ctx.retry = true
          }
        })

        const ctx = createMockContext()
        await manager.execute(ctx, async () => createMockResponse({}))

        expect(attempts).toBe(2)
      })

      it('tracks retryCount across attempts', async () => {
        const manager = new MiddlewareManager()
        const retryCounts: number[] = []

        manager.use(async (ctx, next) => {
          retryCounts.push(ctx.retryCount)
          await next()
          if (ctx.retryCount < 2) {
            ctx.retry = true
          }
        })

        const ctx = createMockContext()
        await manager.execute(ctx, async () => createMockResponse({}))

        expect(retryCounts).toEqual([0, 1, 2])
      })

      it('respects maxRetries limit', async () => {
        const manager = new MiddlewareManager()
        let attempts = 0

        manager.use(async (ctx, next) => {
          attempts++
          await next()
          // Retry on first 2 attempts, stop on 3rd
          if (ctx.retryCount < 2) {
            ctx.retry = true
          }
        })

        const ctx = createMockContext({ maxRetries: 2 })

        // Should complete after 3 attempts (1 initial + 2 retries)
        await manager.execute(ctx, async () => createMockResponse({}))

        expect(attempts).toBe(3)
      })

      it('throws Max retries exceeded when retry is always requested', async () => {
        const manager = new MiddlewareManager()
        let attempts = 0

        manager.use(async (ctx, next) => {
          attempts++
          await next()
          ctx.retry = true // Always request retry
        })

        const ctx = createMockContext({ maxRetries: 2 })

        await expect(
          manager.execute(ctx, async () => createMockResponse({}))
        ).rejects.toThrow('Max retries exceeded')

        expect(attempts).toBe(3) // Still made all 3 attempts
      })

      it('resets ctx.retry and ctx.error on each attempt', async () => {
        const manager = new MiddlewareManager()
        const retryStates: boolean[] = []
        const errorStates: (Error | undefined)[] = []

        manager.use(async (ctx, next) => {
          retryStates.push(ctx.retry)
          errorStates.push(ctx.error)
          await next()
          if (ctx.retryCount === 0) {
            ctx.retry = true
            ctx.error = new Error('test')
          }
        })

        const ctx = createMockContext()
        await manager.execute(ctx, async () => createMockResponse({}))

        // Both attempts should start with retry=false and error=undefined
        expect(retryStates).toEqual([false, false])
        expect(errorStates).toEqual([undefined, undefined])
      })

      it('retries on error when ctx.retry is set', async () => {
        const manager = new MiddlewareManager()
        let attempts = 0

        manager.use(async (ctx, next) => {
          attempts++
          try {
            await next()
          } catch {
            if (attempts === 1) {
              ctx.retry = true
              return // Don't re-throw, let retry happen
            }
            throw ctx.error
          }
        })

        const ctx = createMockContext()
        let handlerCalls = 0

        await manager.execute(ctx, async () => {
          handlerCalls++
          if (handlerCalls === 1) {
            throw new Error('First attempt fails')
          }
          return createMockResponse({ success: true })
        })

        expect(attempts).toBe(2)
        expect(handlerCalls).toBe(2)
      })

      it('throws error after max retries on persistent failure', async () => {
        const manager = new MiddlewareManager()

        manager.use(async (ctx, next) => {
          try {
            await next()
          } catch {
            ctx.retry = true
            throw ctx.error
          }
        })

        const ctx = createMockContext({ maxRetries: 2 })
        const error = new Error('Persistent failure')

        await expect(
          manager.execute(ctx, async () => {
            throw error
          })
        ).rejects.toThrow('Persistent failure')
      })
    })
  })
})
