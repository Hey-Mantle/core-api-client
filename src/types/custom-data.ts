/**
 * Resource type for custom data
 */
export type CustomDataResourceType = 'ticket' | 'customer' | 'contact';

/**
 * Parameters for setting custom data
 */
export interface CustomDataSetParams {
  resourceId: string;
  resourceType: CustomDataResourceType;
  key: string;
  value: string;
}

/**
 * Parameters for getting custom data
 */
export interface CustomDataGetParams {
  resourceId: string;
  resourceType: CustomDataResourceType;
  key: string;
}

/**
 * Response from getting custom data
 */
export interface CustomDataResponse {
  resourceId: string;
  resourceType: CustomDataResourceType;
  key: string;
  value: string;
}

/**
 * Parameters for deleting custom data
 */
export interface CustomDataDeleteParams {
  resourceId: string;
  resourceType: CustomDataResourceType;
  key: string;
}
