/**
 * Available metrics for the Mantle API
 */
export type MetricType =
  | 'PlatformApp.activeInstalls'
  | 'PlatformApp.activeSubscriptions'
  | 'PlatformApp.arr'
  | 'PlatformApp.arpu'
  | 'PlatformApp.charges'
  | 'PlatformApp.logoChurn'
  | 'PlatformApp.ltv'
  | 'PlatformApp.mrr'
  | 'PlatformApp.netInstalls'
  | 'PlatformApp.netRevenue'
  | 'PlatformApp.netRevenueRetention'
  | 'PlatformApp.payout'
  | 'PlatformApp.predictedLtv'
  | 'PlatformApp.revenueChurn'
  | 'PlatformApp.revenueRetention'
  | 'PlatformApp.usageEvent'
  | 'PlatformApp.usageMetric';

/**
 * Available date ranges for metrics
 */
export type DateRangeType =
  | 'last_30_minutes'
  | 'last_60_minutes'
  | 'last_12_hours'
  | 'last_24_hours'
  | 'last_7_days'
  | 'last_14_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'last_12_months'
  | 'last_24_months'
  | 'today'
  | 'yesterday'
  | 'last_month'
  | 'month_to_date'
  | 'quarter_to_date'
  | 'year_to_date'
  | 'all_time'
  | 'custom';

/**
 * Base parameters for metrics requests
 */
export interface MetricsBaseParams {
  appId: string;
  dateRange?: DateRangeType;
  startDate?: string;
  endDate?: string;
  includes?: string[];
  appEventsForMrr?: boolean;
}

/**
 * Parameters for generic metric request
 */
export interface MetricsGetParams extends MetricsBaseParams {
  metric: MetricType | string;
  nf?: boolean;
}

/**
 * Metric data point
 */
export interface MetricDataPoint {
  date?: string;
  value?: number;
  total?: number;
  startingTotal?: number;
  change?: number;
  changePercentage?: number;
  formattedTotal?: string;
  formattedChange?: string;
  formattedChangePercentage?: string;
}

/**
 * Response from metrics endpoint
 */
export interface MetricsResponse {
  data: MetricDataPoint[];
  total?: number;
  startingTotal?: number;
  change?: number;
  changePercentage?: number;
  formattedTotal?: string;
  formattedChange?: string;
  formattedChangePercentage?: string;
}

/**
 * Parameters for usage event metrics
 */
export interface UsageEventMetricsParams extends MetricsBaseParams {
  eventName: string;
  propertyKey?: string;
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max';
}

/**
 * Parameters for usage metric request
 */
export interface UsageMetricParams extends MetricsBaseParams {
  metricId: string;
}
