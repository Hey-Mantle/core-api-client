import type { ListParams, PaginatedResponse } from './common';

/**
 * Social profile for a contact
 */
export interface SocialProfile {
  platform: string;
  url: string;
  username?: string;
}

/**
 * Contact entity
 */
export interface Contact {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  notes?: string;
  tags: string[];
  socialProfiles?: SocialProfile[];
  customers?: Array<{
    id: string;
    name?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing contacts
 */
export interface ContactListParams extends ListParams {}

/**
 * Response from listing contacts
 */
export interface ContactListResponse extends PaginatedResponse {
  contacts: Contact[];
}

/**
 * Parameters for creating a contact
 */
export interface ContactCreateParams {
  name?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  notes?: string;
  tags?: string[];
  customers?: string[];
  socialProfiles?: SocialProfile[];
}

/**
 * Parameters for updating a contact
 */
export interface ContactUpdateParams extends Partial<ContactCreateParams> {}
