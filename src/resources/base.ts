import type { MantleCoreClient } from '../client';

/**
 * Base resource class that all resources extend.
 * Provides common HTTP methods that delegate to the client.
 */
export abstract class BaseResource {
  protected readonly client: MantleCoreClient;

  constructor(client: MantleCoreClient) {
    this.client = client;
  }

  protected get<T>(
    endpoint: string,
    params?: Record<string, unknown> | object
  ): Promise<T> {
    return this.client.get<T>(endpoint, params as Record<string, unknown>);
  }

  protected post<T>(
    endpoint: string,
    data?: Record<string, unknown> | object
  ): Promise<T> {
    return this.client.post<T>(endpoint, data as Record<string, unknown>);
  }

  protected put<T>(
    endpoint: string,
    data?: Record<string, unknown> | object
  ): Promise<T> {
    return this.client.put<T>(endpoint, data as Record<string, unknown>);
  }

  protected _delete<T>(endpoint: string): Promise<T> {
    return this.client.delete<T>(endpoint);
  }
}
