import { BaseResource } from './base';
import type {
  App,
  AppListParams,
  Plan,
  PlanListParams,
  PlanListResponse,
  PlanCreateParams,
  PlanUpdateParams,
  Feature,
  FeatureCreateParams,
  FeatureUpdateParams,
  Review,
  ReviewCreateParams,
  ReviewUpdateParams,
  UsageMetric,
  UsageMetricCreateParams,
  UsageMetricUpdateParams,
  AppEventListParams,
  AppEventListResponse,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing apps and their related entities (plans, features, reviews, etc.)
 */
export class AppsResource extends BaseResource {
  /**
   * List all apps
   */
  async list(params?: AppListParams): Promise<{ apps: App[] }> {
    return this.get<{ apps: App[] }>('/apps', params);
  }

  /**
   * Retrieve a single app by ID
   */
  async retrieve(appId: string): Promise<{ app: App }> {
    return this.get<{ app: App }>(`/apps/${appId}`);
  }

  // ========== Plans ==========

  /**
   * List plans for an app
   */
  async listPlans(
    appId: string,
    params?: PlanListParams
  ): Promise<PlanListResponse> {
    return this.get<PlanListResponse>(`/apps/${appId}/plans`, params);
  }

  /**
   * Retrieve a single plan
   */
  async retrievePlan(
    appId: string,
    planId: string
  ): Promise<{ plan: Plan }> {
    return this.get<{ plan: Plan }>(`/apps/${appId}/plans/${planId}`);
  }

  /**
   * Create a new plan for an app
   */
  async createPlan(
    appId: string,
    data: PlanCreateParams
  ): Promise<{ plan: Plan }> {
    return this.post<{ plan: Plan }>(`/apps/${appId}/plans`, data);
  }

  /**
   * Update an existing plan
   */
  async updatePlan(
    appId: string,
    planId: string,
    data: PlanUpdateParams
  ): Promise<{ plan: Plan }> {
    return this.put<{ plan: Plan }>(`/apps/${appId}/plans/${planId}`, data);
  }

  /**
   * Archive a plan
   */
  async archivePlan(appId: string, planId: string): Promise<{ plan: Plan }> {
    return this.post<{ plan: Plan }>(
      `/apps/${appId}/plans/${planId}/archive`,
      {}
    );
  }

  /**
   * Unarchive a plan
   */
  async unarchivePlan(appId: string, planId: string): Promise<{ plan: Plan }> {
    return this.post<{ plan: Plan }>(
      `/apps/${appId}/plans/${planId}/unarchive`,
      {}
    );
  }

  // ========== Features ==========

  /**
   * List features for an app
   */
  async listFeatures(appId: string): Promise<{ features: Feature[] }> {
    return this.get<{ features: Feature[] }>(`/apps/${appId}/plans/features`);
  }

  /**
   * Retrieve a single feature
   */
  async retrieveFeature(
    appId: string,
    featureId: string
  ): Promise<{ feature: Feature }> {
    return this.get<{ feature: Feature }>(
      `/apps/${appId}/plans/features/${featureId}`
    );
  }

  /**
   * Create a new feature for an app
   */
  async createFeature(
    appId: string,
    data: FeatureCreateParams
  ): Promise<{ feature: Feature }> {
    return this.post<{ feature: Feature }>(
      `/apps/${appId}/plans/features`,
      data
    );
  }

  /**
   * Update an existing feature
   */
  async updateFeature(
    appId: string,
    featureId: string,
    data: FeatureUpdateParams
  ): Promise<{ feature: Feature }> {
    return this.put<{ feature: Feature }>(
      `/apps/${appId}/plans/features/${featureId}`,
      data
    );
  }

  /**
   * Delete a feature
   */
  async deleteFeature(appId: string, featureId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(
      `/apps/${appId}/plans/features/${featureId}`
    );
  }

  // ========== Reviews ==========

  /**
   * List reviews for an app
   */
  async listReviews(appId: string): Promise<{ reviews: Review[] }> {
    return this.get<{ reviews: Review[] }>(`/apps/${appId}/reviews`);
  }

  /**
   * Retrieve a single review
   */
  async retrieveReview(
    appId: string,
    reviewId: string
  ): Promise<{ review: Review }> {
    return this.get<{ review: Review }>(`/apps/${appId}/reviews/${reviewId}`);
  }

  /**
   * Create a new review for an app
   */
  async createReview(
    appId: string,
    data: ReviewCreateParams
  ): Promise<{ review: Review }> {
    return this.post<{ review: Review }>(`/apps/${appId}/reviews`, data);
  }

  /**
   * Update an existing review
   */
  async updateReview(
    appId: string,
    reviewId: string,
    data: ReviewUpdateParams
  ): Promise<{ review: Review }> {
    return this.put<{ review: Review }>(
      `/apps/${appId}/reviews/${reviewId}`,
      data
    );
  }

  /**
   * Delete a review
   */
  async deleteReview(appId: string, reviewId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/apps/${appId}/reviews/${reviewId}`);
  }

  // ========== Usage Event Metadata ==========

  /**
   * Get usage event names for an app
   */
  async listEventNames(appId: string): Promise<{ eventNames: string[] }> {
    return this.get<{ eventNames: string[] }>(
      `/apps/${appId}/usage_events/event_names`
    );
  }

  /**
   * Get property keys for a specific event name
   */
  async listPropertyKeys(
    appId: string,
    eventName: string
  ): Promise<{ propertyKeys: string[] }> {
    return this.get<{ propertyKeys: string[] }>(
      `/apps/${appId}/usage_events/property_keys`,
      { eventName }
    );
  }

  // ========== Usage Metrics ==========

  /**
   * List usage metrics for an app
   */
  async listUsageMetrics(appId: string): Promise<{ usageMetrics: UsageMetric[] }> {
    return this.get<{ usageMetrics: UsageMetric[] }>(
      `/apps/${appId}/usage_metrics`
    );
  }

  /**
   * Retrieve a single usage metric
   */
  async retrieveUsageMetric(
    appId: string,
    usageMetricId: string
  ): Promise<{ usageMetric: UsageMetric }> {
    return this.get<{ usageMetric: UsageMetric }>(
      `/apps/${appId}/usage_metrics/${usageMetricId}`
    );
  }

  /**
   * Create a new usage metric for an app
   */
  async createUsageMetric(
    appId: string,
    data: UsageMetricCreateParams
  ): Promise<{ usageMetric: UsageMetric }> {
    return this.post<{ usageMetric: UsageMetric }>(
      `/apps/${appId}/usage_metrics`,
      data
    );
  }

  /**
   * Update an existing usage metric
   */
  async updateUsageMetric(
    appId: string,
    usageMetricId: string,
    data: UsageMetricUpdateParams
  ): Promise<{ usageMetric: UsageMetric }> {
    return this.put<{ usageMetric: UsageMetric }>(
      `/apps/${appId}/usage_metrics/${usageMetricId}`,
      data
    );
  }

  /**
   * Delete a usage metric
   */
  async deleteUsageMetric(
    appId: string,
    usageMetricId: string
  ): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(
      `/apps/${appId}/usage_metrics/${usageMetricId}`
    );
  }

  // ========== App Events ==========

  /**
   * List app events
   */
  async listAppEvents(
    appId: string,
    params?: AppEventListParams
  ): Promise<AppEventListResponse> {
    const response = await this.get<AppEventListResponse>(
      `/apps/${appId}/app_events`,
      params
    );
    return {
      appEvents: response.appEvents || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }
}
