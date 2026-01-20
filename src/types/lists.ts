import type { ListParams, PaginatedResponse } from './common';

export interface List {
  id: string;
  name: string;
  description: string | null;
  customerCount?: number;
  contactCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListEntity {
  _type: 'customer' | 'contact';
  id: string;
  name: string;
  email: string;
  tags: string[];
  createdAt: string;
  domain?: string;
  shopifyDomain?: string;
  phone?: string;
  jobTitle?: string;
}

export interface ListListParams extends ListParams {
  all?: boolean;
}

export interface ListListResponse extends PaginatedResponse {
  lists: List[];
}

export interface ListRetrieveParams {
  page?: number;
  take?: number;
  type?: 'customer' | 'contact';
  search?: string;
  sort?: 'name' | 'email' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

export interface ListRetrieveResponse extends PaginatedResponse {
  list: List;
  entities: ListEntity[];
}

export interface ListCreateParams {
  name: string;
  description?: string;
}

export interface ListUpdateParams {
  name?: string;
  description?: string;
}

export interface ListAddEntitiesParams {
  customerIds?: string[];
  contactIds?: string[];
}

export interface ListAddEntitiesResponse {
  added: number;
  skipped: number;
}

export interface ListRemoveEntitiesParams {
  customerIds?: string[];
  contactIds?: string[];
}

export interface ListRemoveEntitiesResponse {
  removed: number;
}
