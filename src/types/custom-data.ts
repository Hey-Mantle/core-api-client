/**
 * Resource type for custom data
 */
export type CustomDataResourceType = 'ticket' | 'customer' | 'contact' | 'deal' | 'conversation';

/**
 * Field type for custom data
 */
export type CustomDataFieldType =
  | 'string'
  | 'boolean'
  | 'url'
  | 'date'
  | 'date_time'
  | 'json'
  | 'number_integer'
  | 'number_decimal'
  | 'select_single'
  | 'select_multiple';

/**
 * Parameters for setting custom data
 */
export interface CustomDataSetParams {
  resourceId: string;
  resourceType: CustomDataResourceType;
  key: string;
  value: string | string[];
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
  value: string | boolean | number | object | string[];
  type?: CustomDataFieldType;
  name?: string;
  options?: string[] | null;
}

/**
 * Parameters for deleting custom data
 */
export interface CustomDataDeleteParams {
  resourceId: string;
  resourceType: CustomDataResourceType;
  key: string;
}
