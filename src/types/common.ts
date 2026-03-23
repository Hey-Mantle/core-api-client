import type { Middleware } from 'openapi-fetch';

/**
 * Result returned by the refreshAccessToken callback.
 */
export interface TokenRefreshResult {
  /** The new access token */
  accessToken: string;
  /** When the new token expires. Used for preemptive refresh on subsequent requests. */
  expiresAt?: Date;
}

/**
 * Configuration for the MantleCoreClient
 */
export interface MantleCoreClientConfig {
  /** Base URL for API requests. Defaults to "https://api.heymantle.com/v1" */
  baseURL?: string;
  /** API key for authentication (server-side only) */
  apiKey?: string;
  /** OAuth access token for authentication */
  accessToken?: string;
  /**
   * When the access token expires. If set, the client will proactively
   * call refreshAccessToken before sending a request with an expired token.
   */
  accessTokenExpiresAt?: Date;
  /**
   * Callback to obtain a fresh access token. Called automatically when:
   * - accessTokenExpiresAt is in the past (preemptive, before the request)
   * - A 401 response is received for an expired/revoked token (reactive)
   *
   * The callback owns the full refresh lifecycle: look up the refresh token,
   * call the auth server, persist the new credentials, and return the new
   * access token. Concurrent requests will share a single in-flight refresh.
   */
  refreshAccessToken?: () => Promise<TokenRefreshResult>;
  /** Request timeout in milliseconds. Defaults to 30000 */
  timeout?: number;
  /** openapi-fetch middleware to register on instantiation */
  middleware?: Middleware[];
  /**
   * Custom fetch implementation. When provided, auth headers should be handled
   * by the custom fetch function (apiKey and accessToken can be omitted).
   */
  fetch?: typeof globalThis.fetch;
}
