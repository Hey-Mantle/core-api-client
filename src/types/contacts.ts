import type { ListParams, PaginatedResponse } from "./common";

/**
 * Valid social profile types
 */
export type SocialProfileType =
  | "linkedin"
  | "x"
  | "facebook"
  | "instagram"
  | "website";

/**
 * Social profile for a contact
 */
export interface SocialProfile {
  key: SocialProfileType;
  value: string;
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
    label?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing contacts
 */
export interface ContactListParams extends ListParams {
  /** Filter by social profile type */
  socialProfileType?: SocialProfileType;
  /** Filter by social profile URL */
  socialProfileUrl?: string;
}

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
  customers?: string[] | Array<{ id: string; label?: string }>;
  socialProfiles?: SocialProfile[];
}

/**
 * Parameters for updating a contact
 */
export interface ContactUpdateParams extends Partial<ContactCreateParams> {}

/**
 * Response from creating/upserting a contact
 */
export interface ContactCreateResponse {
  contact: Contact;
  /** True if a new contact was created, false if an existing contact was updated */
  created: boolean;
}
