import type { Middleware } from 'openapi-fetch';

/**
 * Options for the auth refresh middleware
 */
export interface AuthRefreshOptions {
  /**
   * Function to refresh the access token.
   * Should return the new access token.
   */
  refreshToken: () => Promise<string>;
  /**
   * Callback invoked when the client instance's auth should be updated.
   * Receives the new token string.
   */
  updateAuth: (newToken: string) => void;
  /** Optional callback when refresh succeeds */
  onRefreshSuccess?: (newToken: string) => void;
  /** Optional callback when refresh fails */
  onRefreshFailed?: (error: Error) => void;
  /** Maximum refresh attempts per request (default: 1) */
  maxRefreshAttempts?: number;
}

/**
 * Creates an openapi-fetch middleware that automatically refreshes access
 * tokens on 401 responses.
 *
 * @example
 * ```typescript
 * const client = new MantleCoreClient({ accessToken: 'initial-token' });
 *
 * client.use(createAuthRefreshMiddleware({
 *   refreshToken: async () => {
 *     const res = await fetch('/refresh', { method: 'POST' });
 *     const data = await res.json();
 *     return data.accessToken;
 *   },
 *   updateAuth: (newToken) => client.updateAuth({ accessToken: newToken }),
 *   onRefreshSuccess: (newToken) => localStorage.setItem('accessToken', newToken),
 * }));
 * ```
 */
export function createAuthRefreshMiddleware(options: AuthRefreshOptions): Middleware {
  const {
    refreshToken,
    updateAuth,
    onRefreshSuccess,
    onRefreshFailed,
    maxRefreshAttempts = 1,
  } = options;

  let refreshAttempts = 0;
  let requestClone: Request | undefined;

  return {
    async onRequest({ request }) {
      // Clone the request before it's consumed by fetch so we can retry on 401
      requestClone = request.clone();
      return undefined;
    },
    async onResponse({ request, response }) {
      if (response.status !== 401) return undefined;
      if (refreshAttempts >= maxRefreshAttempts) {
        refreshAttempts = 0;
        return undefined;
      }

      // Only refresh on expired tokens — not on invalid/malformed tokens
      // where a refresh would not help. We clone the response so the
      // original can still be read by the caller if we don't retry.
      try {
        const body = await response.clone().json();
        const errorMsg = typeof body?.error === 'string' ? body.error : '';
        if (errorMsg.startsWith('invalid_token') || errorMsg.startsWith('invalid_client')) {
          return undefined; // Token is invalid, not expired — don't retry
        }
      } catch {
        // Can't parse body — proceed with refresh attempt
      }

      refreshAttempts++;

      try {
        const newToken = await refreshToken();
        updateAuth(newToken);
        onRefreshSuccess?.(newToken);
        refreshAttempts = 0;

        // Retry using the cloned request (original body stream is consumed)
        const retrySource = requestClone || request;
        const headers = new Headers(retrySource.headers);
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(new Request(retrySource.url, {
          method: retrySource.method,
          headers,
          body: retrySource.body,
          signal: request.signal,
        }));
      } catch (refreshError) {
        refreshAttempts = 0;
        onRefreshFailed?.(refreshError as Error);
        return undefined;
      }
    },
  };
}
