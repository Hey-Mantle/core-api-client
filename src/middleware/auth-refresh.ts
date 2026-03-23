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

  const requestClones = new WeakMap<Request, { clone: Request; refreshAttempts: number }>();

  return {
    async onRequest({ request }) {
      // Clone the request before it's consumed by fetch so we can retry on 401.
      // Keyed per-request to avoid races when multiple requests are in flight.
      requestClones.set(request, { clone: request.clone(), refreshAttempts: 0 });
      return undefined;
    },
    async onResponse({ request, response }) {
      if (response.status !== 401) return undefined;
      let state = requestClones.get(request);
      if (!state) {
        // onRequest may not have been called (e.g. direct onResponse invocation);
        // create state on-the-fly so retry still works.
        state = { clone: request.clone(), refreshAttempts: 0 };
        requestClones.set(request, state);
      }
      if (state.refreshAttempts >= maxRefreshAttempts) {
        requestClones.delete(request);
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

      state.refreshAttempts++;

      try {
        const newToken = await refreshToken();
        updateAuth(newToken);
        onRefreshSuccess?.(newToken);
        requestClones.delete(request);

        // Retry using the cloned request (original body stream is consumed)
        const retrySource = state.clone;
        const headers = new Headers(retrySource.headers);
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(new Request(retrySource.url, {
          method: retrySource.method,
          headers,
          body: retrySource.body,
          signal: request.signal,
        }));
      } catch (refreshError) {
        requestClones.delete(request);
        onRefreshFailed?.(refreshError as Error);
        return undefined;
      }
    },
  };
}
