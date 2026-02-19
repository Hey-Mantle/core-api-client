import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class MeetingsResource extends BaseResource {
  async list(params?: paths['/meetings']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/meetings', { params: { query: params } }));
  }

  async retrieve(meetingId: string) {
    return this.unwrap(this.api.GET('/meetings/{id}', { params: { path: { id: meetingId } } }));
  }

  async create(data: paths['/meetings']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/meetings', { body: data }));
  }

  async update(meetingId: string, data: paths['/meetings/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/meetings/{id}', { params: { path: { id: meetingId } }, body: data }));
  }

  async del(meetingId: string) {
    return this.unwrap(this.api.DELETE('/meetings/{id}', { params: { path: { id: meetingId } } }));
  }
}
