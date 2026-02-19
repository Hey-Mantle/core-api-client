import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class AppsResource extends BaseResource {
  // Apps
  async list(params?: paths['/apps']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/apps', { params: { query: params } }));
  }

  async retrieve(appId: string) {
    return this.unwrap(this.api.GET('/apps/{id}', { params: { path: { id: appId } } }));
  }

  // Plans
  async listPlans(appId: string, params?: paths['/apps/{id}/plans']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/apps/{id}/plans', { params: { path: { id: appId }, query: params } }));
  }

  async retrievePlan(appId: string, planId: string) {
    return this.unwrap(this.api.GET('/apps/{id}/plans/{planId}', { params: { path: { id: appId, planId } } }));
  }

  async createPlan(appId: string, data: paths['/apps/{id}/plans']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/apps/{id}/plans', { params: { path: { id: appId } }, body: data }));
  }

  async updatePlan(appId: string, planId: string, data: paths['/apps/{id}/plans/{planId}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/apps/{id}/plans/{planId}', { params: { path: { id: appId, planId } }, body: data }));
  }

  async archivePlan(appId: string, planId: string) {
    return this.unwrap(this.api.PUT('/apps/{id}/plans/{planId}/archive', { params: { path: { id: appId, planId } } }));
  }

  async unarchivePlan(appId: string, planId: string) {
    return this.unwrap(this.api.PUT('/apps/{id}/plans/{planId}/unarchive', { params: { path: { id: appId, planId } } }));
  }

  // Features
  async listFeatures(appId: string) {
    return this.unwrap(this.api.GET('/apps/{appId}/plans/features', { params: { path: { appId } } }));
  }

  async retrieveFeature(appId: string, featureId: string) {
    return this.unwrap(this.api.GET('/apps/{appId}/plans/features/{featureId}', { params: { path: { appId, featureId } } }));
  }

  async createFeature(appId: string, data: paths['/apps/{appId}/plans/features']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/apps/{appId}/plans/features', { params: { path: { appId } }, body: data }));
  }

  async updateFeature(appId: string, featureId: string, data: paths['/apps/{appId}/plans/features/{featureId}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/apps/{appId}/plans/features/{featureId}', { params: { path: { appId, featureId } }, body: data }));
  }

  async deleteFeature(appId: string, featureId: string) {
    return this.unwrap(this.api.DELETE('/apps/{appId}/plans/features/{featureId}', { params: { path: { appId, featureId } } }));
  }

  // Reviews
  async listReviews(appId: string) {
    return this.unwrap(this.api.GET('/apps/{id}/reviews', { params: { path: { id: appId } } }));
  }

  async retrieveReview(appId: string, reviewId: string) {
    return this.unwrap(this.api.GET('/apps/{id}/reviews/{reviewId}', { params: { path: { id: appId, reviewId } } }));
  }

  // Usage Metrics
  async listUsageMetrics(appId: string) {
    return this.unwrap(this.api.GET('/apps/{id}/usage_metrics', { params: { path: { id: appId } } }));
  }

  async retrieveUsageMetric(appId: string, usageMetricId: string) {
    return this.unwrap(this.api.GET('/apps/{id}/usage_metrics/{usageMetricId}', { params: { path: { id: appId, usageMetricId } } }));
  }

  async createUsageMetric(appId: string, data: paths['/apps/{id}/usage_metrics']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/apps/{id}/usage_metrics', { params: { path: { id: appId } }, body: data }));
  }

  async updateUsageMetric(appId: string, usageMetricId: string, data: paths['/apps/{id}/usage_metrics/{usageMetricId}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/apps/{id}/usage_metrics/{usageMetricId}', { params: { path: { id: appId, usageMetricId } }, body: data }));
  }

  async deleteUsageMetric(appId: string, usageMetricId: string) {
    return this.unwrap(this.api.DELETE('/apps/{id}/usage_metrics/{usageMetricId}', { params: { path: { id: appId, usageMetricId } } }));
  }

  // App Events
  async listAppEvents(appId: string, params?: paths['/apps/{id}/app_events']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/apps/{id}/app_events', { params: { path: { id: appId }, query: params } }));
  }

  async retrieveAppEvent(appId: string, appEventId: string) {
    return this.unwrap(this.api.GET('/apps/{id}/app_events/{appEventId}', { params: { path: { id: appId, appEventId } } }));
  }

  async createAppEvent(appId: string, data: paths['/apps/{id}/app_events']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/apps/{id}/app_events', { params: { path: { id: appId } }, body: data }));
  }
}
