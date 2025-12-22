// Middleware types
export type {
  Middleware,
  MiddlewareContext,
  MiddlewareRequest,
  MiddlewareResponse,
  MiddlewareOptions,
  NextFunction,
  HttpMethod,
} from './types'

// Middleware manager (for advanced usage)
export { MiddlewareManager } from './manager'

// Built-in middleware
export { createAuthRefreshMiddleware, type AuthRefreshOptions } from './auth-refresh'
export { createRateLimitMiddleware, type RateLimitOptions } from './rate-limit'
