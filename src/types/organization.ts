import type { ListParams, PaginatedResponse } from './common';

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  customerTags?: string[];
  contactTags?: string[];
  websiteUrl?: string;
  supportEmail?: string;
  socialNetworks?: Record<string, string>;
  mantleFeatures?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing users
 */
export interface UserListParams extends ListParams {}

/**
 * Response from listing users
 */
export interface UserListResponse extends PaginatedResponse {
  users: User[];
}

/**
 * Response from /me endpoint
 */
export interface MeResponse {
  user: User;
  organization: Organization;
}

/**
 * Agent entity (support agent)
 */
export interface Agent {
  id: string;
  userId: string;
  name?: string;
  email: string;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response from listing agents
 */
export interface AgentListResponse {
  agents: Agent[];
}
