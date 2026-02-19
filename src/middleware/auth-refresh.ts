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

  return {
    async onResponse({ request, response }) {
      if (response.status !== 401) return undefined;
      if (refreshAttempts >= maxRefreshAttempts) {
        refreshAttempts = 0;
        return undefined;
      }

      refreshAttempts++;

      try {
        const newToken = await refreshToken();
        updateAuth(newToken);
        onRefreshSuccess?.(newToken);
        refreshAttempts = 0;

        // Retry the original request with the new token
        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(new Request(request.url, {
          method: request.method,
          headers,
          body: request.body,
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
