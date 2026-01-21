import type { Contact } from './contacts';
import type { Customer } from './customers';
import type { PaginatedResponse } from './common';

/**
 * Entity type discriminator
 */
export type EntityType = 'contact' | 'customer';

/**
 * Contact entity with type discriminator for unified search results
 */
export interface ContactEntity extends Contact {
  _type: 'contact';
}

/**
 * Customer entity with type discriminator for unified search results
 */
export interface CustomerEntity extends Customer {
  _type: 'customer';
}

/**
 * Union type for entities returned from unified search
 */
export type Entity = ContactEntity | CustomerEntity;

/**
 * Parameters for searching entities
 */
export interface EntitiesSearchParams {
  search?: string;
  take?: number;
}

/**
 * Response from searching entities
 */
export interface EntitiesSearchResponse extends PaginatedResponse {
  entities: Entity[];
}
