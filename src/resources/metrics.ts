import { BaseResource } from './base';
import type {
  MetricsGetParams,
  MetricsResponse,
  MetricsBaseParams,
  UsageEventMetricsParams,
  UsageMetricParams,
  DateRangeType,
} from '../types';

/**
 * Resource for retrieving metrics and analytics
 */
export class MetricsResource extends BaseResource {
  /**
   * Fetch metrics with custom parameters
   */
  async fetch(params: MetricsGetParams): Promise<MetricsResponse> {
    const response = await this.client.get<unknown[]>('/metrics', {
      ...params,
      includes: params.includes || ['includeTotal'],
      appEventsForMrr: params.appEventsForMrr ?? true,
    });

    // Normalize response
    const data = Array.isArray(response) ? response : [];
    const first = data[0] as MetricsResponse | undefined;

    return {
      data: data as MetricsResponse['data'],
      total: first?.total,
      startingTotal: first?.startingTotal,
      change: first?.change,
      changePercentage: first?.changePercentage,
      formattedTotal: first?.formattedTotal,
      formattedChange: first?.formattedChange,
      formattedChangePercentage: first?.formattedChangePercentage,
    };
  }

  /**
   * Get Annual Recurring Revenue (ARR)
   */
  async arr(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.arr',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get Monthly Recurring Revenue (MRR)
   */
  async mrr(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.mrr',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get active subscriptions count
   */
  async activeSubscriptions(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.activeSubscriptions',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get active installations count
   */
  async activeInstalls(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.activeInstalls',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get net new installations
   */
  async netInstalls(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.netInstalls',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get Average Revenue Per User (ARPU)
   */
  async arpu(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.arpu',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get Lifetime Value (LTV)
   */
  async ltv(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.ltv',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get revenue churn rate
   */
  async revenueChurn(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.revenueChurn',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get logo (customer) churn rate
   */
  async logoChurn(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.logoChurn',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get revenue retention rate
   */
  async revenueRetention(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.revenueRetention',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get net revenue retention rate
   */
  async netRevenueRetention(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.netRevenueRetention',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get net revenue
   */
  async netRevenue(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.netRevenue',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get payout amount
   */
  async payout(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.payout',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get predicted Lifetime Value
   */
  async predictedLtv(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.predictedLtv',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get charges
   */
  async charges(
    params: MetricsBaseParams & { dateRange?: DateRangeType }
  ): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.charges',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get usage event metrics
   */
  async usageEvent(params: UsageEventMetricsParams): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.usageEvent',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }

  /**
   * Get usage metric data
   */
  async usageMetric(params: UsageMetricParams): Promise<MetricsResponse> {
    return this.fetch({
      metric: 'PlatformApp.usageMetric',
      dateRange: params.dateRange || 'last_30_days',
      ...params,
    });
  }
}
