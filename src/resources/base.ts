import type { Client } from 'openapi-fetch';
import type { paths } from '../generated/api';
import {
  MantleAPIError,
  MantleAuthenticationError,
  MantlePermissionError,
  MantleValidationError,
  MantleRateLimitError,
} from '../utils/errors';

export type ApiClient = Client<paths>;

export interface ApiClientHost {
  readonly _api: ApiClient;
}

/**
 * Base resource class that all resources extend.
 * Provides the unwrap() helper that bridges openapi-fetch's { data, error }
 * pattern with the SDK's throw-on-error interface.
 */
export abstract class BaseResource {
  constructor(protected readonly client: ApiClientHost) {}

  protected get api(): ApiClient {
    return this.client._api;
  }

  /**
   * Access the API client without path type-checking.
   * Used for endpoints not yet in the OpenAPI spec.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected get untypedApi(): Client<any> {
    return this.client._api;
  }

  /**
   * Unwraps an openapi-fetch response, throwing typed errors on failure.
   */
  protected async unwrap<T>(
    promise: Promise<{ data?: T; error?: unknown; response: Response }>
  ): Promise<T> {
    const { data, error, response } = await promise;
    if (error !== undefined) {
      throw this.createError(response, error);
    }
    return data as T;
  }

  private createError(response: Response, error: unknown): MantleAPIError {
    const err = error as Record<string, unknown> | undefined;
    const message =
      (typeof err?.error === 'string' ? err.error : null) ||
      `API request failed: ${response.status}`;
    const details = typeof err?.details === 'string' ? err.details : undefined;

    switch (response.status) {
      case 401:
        return new MantleAuthenticationError(message);
      case 403:
        return new MantlePermissionError(message);
      case 404:
        return new MantleAPIError(message, 404, details);
      case 422:
        return new MantleValidationError(message, details);
      case 429: {
        const retryAfter = response.headers.get('Retry-After');
        return new MantleRateLimitError(
          message,
          retryAfter ? parseInt(retryAfter, 10) : undefined
        );
      }
      default:
        return new MantleAPIError(message, response.status, details);
    }
  }
}
