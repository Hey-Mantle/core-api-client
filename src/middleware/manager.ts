import type {
  Middleware,
  MiddlewareContext,
  MiddlewareOptions,
  MiddlewareResponse,
} from './types'

interface RegisteredMiddleware {
  fn: Middleware
  name: string
  priority: number
}

/**
 * Manages middleware registration and execution
 */
export class MiddlewareManager {
  private middlewares: RegisteredMiddleware[] = []

  /**
   * Register a middleware function
   *
   * @param middleware - The middleware function to register
   * @param options - Optional configuration
   * @returns this for chaining
   */
  use(middleware: Middleware, options: MiddlewareOptions = {}): this {
    const registered: RegisteredMiddleware = {
      fn: middleware,
      name: options.name ?? `middleware_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      priority: options.priority ?? 100,
    }

    this.middlewares.push(registered)
    this.middlewares.sort((a, b) => a.priority - b.priority)

    return this
  }

  /**
   * Remove a middleware by name
   *
   * @param name - The name of the middleware to remove
   * @returns true if removed, false if not found
   */
  remove(name: string): boolean {
    const index = this.middlewares.findIndex((m) => m.name === name)
    if (index !== -1) {
      this.middlewares.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Get all registered middleware names
   */
  list(): string[] {
    return this.middlewares.map((m) => m.name)
  }

  /**
   * Check if any middleware is registered
   */
  hasMiddleware(): boolean {
    return this.middlewares.length > 0
  }

  /**
   * Execute the middleware chain with retry support
   *
   * @param ctx - The middleware context
   * @param coreHandler - The core request handler to call at the end of the chain
   * @returns The response from the core handler
   */
  async execute<T>(
    ctx: MiddlewareContext<T>,
    coreHandler: () => Promise<MiddlewareResponse<T>>
  ): Promise<MiddlewareResponse<T>> {
    const maxAttempts = ctx.maxRetries + 1
    let attempts = 0

    while (attempts < maxAttempts) {
      ctx.retryCount = attempts
      ctx.retry = false
      ctx.error = undefined

      try {
        await this.runChain(ctx, coreHandler)

        if (!ctx.retry) {
          return ctx.response!
        }

        // Reset for retry
        attempts++
      } catch (error) {
        if (!ctx.retry || attempts >= maxAttempts - 1) {
          throw error
        }

        // Reset for retry
        attempts++
      }
    }

    throw ctx.error ?? new Error('Max retries exceeded')
  }

  /**
   * Run the middleware chain (onion model)
   */
  private async runChain<T>(
    ctx: MiddlewareContext<T>,
    coreHandler: () => Promise<MiddlewareResponse<T>>
  ): Promise<void> {
    let index = -1

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }
      index = i

      if (i < this.middlewares.length) {
        // Execute middleware
        const middleware = this.middlewares[i]
        await middleware.fn(ctx, () => dispatch(i + 1))
      } else {
        // Core request execution
        try {
          ctx.response = await coreHandler()
        } catch (error) {
          ctx.error = error as Error
          throw error
        }
      }
    }

    await dispatch(0)
  }
}
