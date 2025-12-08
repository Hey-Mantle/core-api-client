import type { Middleware, MiddlewareOptions } from '../middleware/types';

/**
 * Middleware configuration item
 */
export type MiddlewareConfig = Middleware | [Middleware, MiddlewareOptions];

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
  /** Middleware to register on instantiation */
  middleware?: MiddlewareConfig[];
}

/**
 * Generic paginated list response
 */
export interface PaginatedResponse {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total?: number;
  cursor?: string;
}

/**
 * Common list parameters for paginated endpoints
 */
export interface ListParams {
  /** Page number for offset pagination (0-indexed) */
  page?: number;
  /** Number of items per page */
  take?: number;
  /** Cursor for cursor-based pagination */
  cursor?: string;
  /** Field to sort by */
  sort?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Search query */
  search?: string;
  /** Minimum updated date filter (ISO 8601) */
  minUpdatedAt?: string;
  /** Maximum updated date filter (ISO 8601) */
  maxUpdatedAt?: string;
  /** Allow additional string keys */
  [key: string]: unknown;
}

/**
 * Request options for internal HTTP client
 */
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
  headers?: Record<string, string>;
}

/**
 * Standard success response for delete operations
 */
export interface DeleteResponse {
  success: boolean;
}
