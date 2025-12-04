import { BaseResource } from './base';
import type { Channel, ChannelListParams, ChannelCreateParams } from '../types';

/**
 * Resource for managing CX channels
 */
export class ChannelsResource extends BaseResource {
  /**
   * List CX channels
   */
  async list(params?: ChannelListParams): Promise<{ channels: Channel[] }> {
    return this.get<{ channels: Channel[] }>('/channels', params);
  }

  /**
   * Create a new CX channel
   */
  async create(data: ChannelCreateParams): Promise<{ channel: Channel }> {
    return this.post<{ channel: Channel }>('/channels', data);
  }
}
