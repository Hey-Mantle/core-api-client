/**
 * Middleware types for the Mantle Core API Client
 */

/**
 * HTTP methods supported by the client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/**
 * Request information passed through the middleware chain
 */
export interface MiddlewareRequest {
  /** Full URL (baseURL + endpoint) */
  url: string
  /** HTTP method */
  method: HttpMethod
  /** Request headers */
  headers: Record<string, string>
  /** Request body (for POST/PUT) */
  body?: string
  /** Original endpoint (before baseURL prepend) */
  endpoint: string
}

/**
 * Response information returned through the middleware chain
 */
export interface MiddlewareResponse<T = unknown> {
  /** Parsed response data */
  data: T
  /** HTTP status code */
  status: number
  /** Response headers */
  headers: Headers
}

/**
 * Context object passed to middleware functions
 */
export interface MiddlewareContext<T = unknown> {
  /** The request being made */
  request: MiddlewareRequest
  /** The response (populated after downstream execution) */
  response?: MiddlewareResponse<T>
  /** Error that occurred (if any) */
  error?: Error
  /** Set to true to retry the request */
  retry: boolean
  /** Number of retry attempts made */
  retryCount: number
  /** Maximum retry attempts allowed (default: 3) */
  maxRetries: number
  /** Update the client's auth credentials */
  updateAuth: (credentials: { apiKey?: string; accessToken?: string }) => void
}

/**
 * Next function to call the next middleware in the chain
 */
export type NextFunction = () => Promise<void>

/**
 * Middleware function signature (Koa-style)
 *
 * @example
 * ```typescript
 * const loggingMiddleware: Middleware = async (ctx, next) => {
 *   console.log('Request:', ctx.request.url)
 *   await next()
 *   console.log('Response:', ctx.response?.status)
 * }
 * ```
 */
export type Middleware<T = unknown> = (
  ctx: MiddlewareContext<T>,
  next: NextFunction
) => Promise<void>

/**
 * Options for registering middleware
 */
export interface MiddlewareOptions {
  /** Unique name for debugging/removal */
  name?: string
  /** Priority (lower = earlier execution, default: 100) */
  priority?: number
}
