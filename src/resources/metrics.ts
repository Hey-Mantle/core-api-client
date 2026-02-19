import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class MetricsResource extends BaseResource {
  async mrr(params?: paths['/api/core/v1/metrics/mrr']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/mrr', { params: { query: params } }));
  }

  async arr(params?: paths['/api/core/v1/metrics/arr']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/arr', { params: { query: params } }));
  }

  async arpu(params?: paths['/api/core/v1/metrics/arpu']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/arpu', { params: { query: params } }));
  }

  async activeSubscriptions(params?: paths['/api/core/v1/metrics/activeSubscriptions']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/activeSubscriptions', { params: { query: params } }));
  }

  async activeInstalls(params?: paths['/api/core/v1/metrics/activeInstalls']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/activeInstalls', { params: { query: params } }));
  }

  async netInstalls(params?: paths['/api/core/v1/metrics/netInstalls']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/netInstalls', { params: { query: params } }));
  }

  async logoChurn(params?: paths['/api/core/v1/metrics/logoChurn']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/logoChurn', { params: { query: params } }));
  }

  async revenueChurn(params?: paths['/api/core/v1/metrics/revenueChurn']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/revenueChurn', { params: { query: params } }));
  }

  async revenueRetention(params?: paths['/api/core/v1/metrics/revenueRetention']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/revenueRetention', { params: { query: params } }));
  }

  async netRevenueRetention(params?: paths['/api/core/v1/metrics/netRevenueRetention']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/netRevenueRetention', { params: { query: params } }));
  }

  async netRevenue(params?: paths['/api/core/v1/metrics/netRevenue']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/netRevenue', { params: { query: params } }));
  }

  async payout(params?: paths['/api/core/v1/metrics/payout']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/payout', { params: { query: params } }));
  }

  async predictedLtv(params?: paths['/api/core/v1/metrics/predictedLtv']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/predictedLtv', { params: { query: params } }));
  }

  async usageEvent(params: paths['/api/core/v1/metrics/usageEvent']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/usageEvent', { params: { query: params } }));
  }

  async usageMetric(params: paths['/api/core/v1/metrics/usageMetric']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/api/core/v1/metrics/usageMetric', { params: { query: params } }));
  }
}
