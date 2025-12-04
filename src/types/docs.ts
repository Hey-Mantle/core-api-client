import type { PaginatedResponse } from './common';

/**
 * Doc collection entity
 */
export interface DocCollection {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a doc collection
 */
export interface DocCollectionCreateParams {
  name: string;
  slug?: string;
  description?: string;
}

/**
 * Parameters for updating a doc collection
 */
export interface DocCollectionUpdateParams
  extends Partial<DocCollectionCreateParams> {}

/**
 * Doc group entity
 */
export interface DocGroup {
  id: string;
  collectionId: string;
  name: string;
  slug?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a doc group
 */
export interface DocGroupCreateParams {
  name: string;
  collectionId: string;
  slug?: string;
  order?: number;
}

/**
 * Parameters for updating a doc group
 */
export interface DocGroupUpdateParams
  extends Partial<Omit<DocGroupCreateParams, 'collectionId'>> {}

/**
 * Doc page status
 */
export type DocPageStatus = 'draft' | 'published' | 'archived';

/**
 * Doc page entity
 */
export interface DocPage {
  id: string;
  collectionId: string;
  groupId?: string;
  title: string;
  slug?: string;
  content?: string;
  status: DocPageStatus;
  order?: number;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing doc pages
 */
export interface DocPageListParams {
  collectionId?: string;
  groupId?: string;
  status?: DocPageStatus;
}

/**
 * Response from listing doc pages
 */
export interface DocPageListResponse extends PaginatedResponse {
  pages: DocPage[];
}

/**
 * Parameters for creating a doc page
 */
export interface DocPageCreateParams {
  title: string;
  collectionId: string;
  groupId?: string;
  slug?: string;
  content?: string;
  order?: number;
}

/**
 * Parameters for updating a doc page
 */
export interface DocPageUpdateParams
  extends Partial<Omit<DocPageCreateParams, 'collectionId'>> {}

/**
 * Doc tree node
 */
export interface DocTreeNode {
  id: string;
  type: 'collection' | 'group' | 'page';
  name: string;
  slug?: string;
  children?: DocTreeNode[];
}

/**
 * Doc tree response
 */
export interface DocTreeResponse {
  tree: DocTreeNode[];
}
