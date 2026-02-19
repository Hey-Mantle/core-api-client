import type { Middleware } from 'openapi-fetch';

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
  /** Request timeout in milliseconds. Defaults to 30000 */
  timeout?: number;
  /** openapi-fetch middleware to register on instantiation */
  middleware?: Middleware[];
}
