import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class CustomDataResource extends BaseResource {
  async set(data: paths['/custom_data']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/custom_data', { body: data }));
  }

  async getValue(params: paths['/custom_data']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/custom_data', { params: { query: params } }));
  }
}
