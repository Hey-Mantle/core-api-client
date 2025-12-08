import type { Middleware } from './types'
import { MantleAuthenticationError } from '../utils/errors'

/**
 * Options for the auth refresh middleware
 */
export interface AuthRefreshOptions {
  /**
   * Function to refresh the access token
   * Should return the new access token
   */
  refreshToken: () => Promise<string>

  /**
   * Optional callback when refresh succeeds
   */
  onRefreshSuccess?: (newToken: string) => void

  /**
   * Optional callback when refresh fails
   */
  onRefreshFailed?: (error: Error) => void

  /**
   * Maximum refresh attempts per request (default: 1)
   */
  maxRefreshAttempts?: number
}

/**
 * Creates a middleware that automatically refreshes access tokens on 401 errors
 *
 * @example
 * ```typescript
 * const client = new MantleCoreClient({
 *   accessToken: 'initial-token',
 * });
 *
 * client.use(createAuthRefreshMiddleware({
 *   refreshToken: async () => {
 *     const response = await fetch('/refresh', { method: 'POST' });
 *     const data = await response.json();
 *     return data.accessToken;
 *   },
 *   onRefreshSuccess: (newToken) => {
 *     // Persist the new token
 *     localStorage.setItem('accessToken', newToken);
 *   },
 * }), { name: 'auth-refresh' });
 * ```
 */
export function createAuthRefreshMiddleware(options: AuthRefreshOptions): Middleware {
  const {
    refreshToken,
    onRefreshSuccess,
    onRefreshFailed,
    maxRefreshAttempts = 1,
  } = options

  let refreshAttempts = 0

  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      // Only handle authentication errors
      if (!(error instanceof MantleAuthenticationError)) {
        throw error
      }

      // Check if we've exceeded refresh attempts
      if (refreshAttempts >= maxRefreshAttempts) {
        refreshAttempts = 0
        throw error
      }

      refreshAttempts++

      try {
        // Attempt to refresh the token
        const newToken = await refreshToken()

        // Update client auth
        ctx.updateAuth({ accessToken: newToken })

        // Update request headers for retry
        ctx.request.headers.Authorization = `Bearer ${newToken}`

        // Notify success
        onRefreshSuccess?.(newToken)

        // Signal retry
        ctx.retry = true
        refreshAttempts = 0
      } catch (refreshError) {
        refreshAttempts = 0
        onRefreshFailed?.(refreshError as Error)
        throw new MantleAuthenticationError(
          'Authentication failed. Please re-authenticate.'
        )
      }
    }
  }
}
