import type { MantleCoreClientConfig, RequestOptions } from './types/common';
import { sanitizeObject, toQueryString } from './utils/sanitize';
import {
  MantleAPIError,
  MantleAuthenticationError,
  MantlePermissionError,
  MantleValidationError,
  MantleRateLimitError,
} from './utils/errors';

// Import all resources
import { CustomersResource } from './resources/customers';
import { ContactsResource } from './resources/contacts';
import { SubscriptionsResource } from './resources/subscriptions';
import { UsageEventsResource } from './resources/usage-events';
import { AppsResource } from './resources/apps';
import { DealsResource } from './resources/deals';
import { DealFlowsResource } from './resources/deal-flows';
import { DealActivitiesResource } from './resources/deal-activities';
import { TicketsResource } from './resources/tickets';
import { ChannelsResource } from './resources/channels';
import { FlowsResource } from './resources/flows';
import { TasksResource } from './resources/tasks';
import { WebhooksResource } from './resources/webhooks';
import { CompaniesResource } from './resources/companies';
import { CustomerSegmentsResource } from './resources/customer-segments';
import { AffiliatesResource } from './resources/affiliates';
import { AffiliateProgramsResource } from './resources/affiliate-programs';
import { AffiliateCommissionsResource } from './resources/affiliate-commissions';
import { AffiliatePayoutsResource } from './resources/affiliate-payouts';
import { AffiliateReferralsResource } from './resources/affiliate-referrals';
import { ChargesResource } from './resources/charges';
import { TransactionsResource } from './resources/transactions';
import { MetricsResource } from './resources/metrics';
import { UsersResource } from './resources/users';
import { MeResource } from './resources/me';
import { OrganizationResource } from './resources/organization';
import { AgentsResource } from './resources/agents';
import { DocsResource } from './resources/docs';
import { EntitiesResource } from './resources/entities';

/**
 * Mantle Core API Client
 *
 * A TypeScript SDK for interacting with the Mantle Core API.
 * Provides a resource-based interface similar to the Stripe SDK.
 *
 * @example
 * ```typescript
 * const client = new MantleCoreClient({
 *   apiKey: 'your-api-key',
 * });
 *
 * // List customers
 * const { customers } = await client.customers.list({ take: 25 });
 *
 * // Get a specific customer
 * const { customer } = await client.customers.retrieve('cust_123');
 * ```
 */
export class MantleCoreClient {
  private readonly baseURL: string;
  private readonly apiKey?: string;
  private readonly accessToken?: string;
  private readonly timeout: number;

  // Resources
  public readonly customers: CustomersResource;
  public readonly contacts: ContactsResource;
  public readonly subscriptions: SubscriptionsResource;
  public readonly usageEvents: UsageEventsResource;
  public readonly apps: AppsResource;
  public readonly deals: DealsResource;
  public readonly dealFlows: DealFlowsResource;
  public readonly dealActivities: DealActivitiesResource;
  public readonly tickets: TicketsResource;
  public readonly channels: ChannelsResource;
  public readonly flows: FlowsResource;
  public readonly tasks: TasksResource;
  public readonly webhooks: WebhooksResource;
  public readonly companies: CompaniesResource;
  public readonly customerSegments: CustomerSegmentsResource;
  public readonly affiliates: AffiliatesResource;
  public readonly affiliatePrograms: AffiliateProgramsResource;
  public readonly affiliateCommissions: AffiliateCommissionsResource;
  public readonly affiliatePayouts: AffiliatePayoutsResource;
  public readonly affiliateReferrals: AffiliateReferralsResource;
  public readonly charges: ChargesResource;
  public readonly transactions: TransactionsResource;
  public readonly metrics: MetricsResource;
  public readonly users: UsersResource;
  public readonly me: MeResource;
  public readonly organization: OrganizationResource;
  public readonly agents: AgentsResource;
  public readonly docs: DocsResource;
  public readonly entities: EntitiesResource;

  constructor(config: MantleCoreClientConfig) {
    if (!config.apiKey && !config.accessToken) {
      throw new Error(
        'MantleCoreClient requires either apiKey or accessToken'
      );
    }

    this.baseURL = config.baseURL || 'https://api.heymantle.com/v1';
    this.apiKey = config.apiKey;
    this.accessToken = config.accessToken;
    this.timeout = config.timeout || 30000;

    // Initialize all resources
    this.customers = new CustomersResource(this);
    this.contacts = new ContactsResource(this);
    this.subscriptions = new SubscriptionsResource(this);
    this.usageEvents = new UsageEventsResource(this);
    this.apps = new AppsResource(this);
    this.deals = new DealsResource(this);
    this.dealFlows = new DealFlowsResource(this);
    this.dealActivities = new DealActivitiesResource(this);
    this.tickets = new TicketsResource(this);
    this.channels = new ChannelsResource(this);
    this.flows = new FlowsResource(this);
    this.tasks = new TasksResource(this);
    this.webhooks = new WebhooksResource(this);
    this.companies = new CompaniesResource(this);
    this.customerSegments = new CustomerSegmentsResource(this);
    this.affiliates = new AffiliatesResource(this);
    this.affiliatePrograms = new AffiliateProgramsResource(this);
    this.affiliateCommissions = new AffiliateCommissionsResource(this);
    this.affiliatePayouts = new AffiliatePayoutsResource(this);
    this.affiliateReferrals = new AffiliateReferralsResource(this);
    this.charges = new ChargesResource(this);
    this.transactions = new TransactionsResource(this);
    this.metrics = new MetricsResource(this);
    this.users = new UsersResource(this);
    this.me = new MeResource(this);
    this.organization = new OrganizationResource(this);
    this.agents = new AgentsResource(this);
    this.docs = new DocsResource(this);
    this.entities = new EntitiesResource(this);
  }

  /**
   * Performs a GET request to the API
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const sanitizedParams = params ? sanitizeObject(params) : {};
    const query = toQueryString(sanitizedParams);
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  /**
   * Performs a POST request to the API
   */
  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    const sanitizedData = data ? sanitizeObject(data) : {};
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  }

  /**
   * Performs a PUT request to the API
   */
  async put<T>(
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    const sanitizedData = data ? sanitizeObject(data) : {};
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(sanitizedData),
    });
  }

  /**
   * Performs a DELETE request to the API
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Makes an HTTP request to the API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions
  ): Promise<T> {
    const authHeader = this.getAuthHeader();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: options.method,
        body: options.body,
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle empty responses (e.g., 204 No Content)
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof MantleAPIError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new MantleAPIError('Request timeout', 408);
      }

      throw new MantleAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      );
    }
  }

  /**
   * Gets the authorization header value
   */
  private getAuthHeader(): string {
    if (this.accessToken) {
      return `Bearer ${this.accessToken}`;
    }
    if (this.apiKey) {
      return `Bearer ${this.apiKey}`;
    }
    throw new MantleAuthenticationError(
      'Authentication not configured. Please set up API key or OAuth.'
    );
  }

  /**
   * Handles error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: { error?: string; details?: string } = {};

    try {
      const text = await response.text();
      if (text) {
        errorData = JSON.parse(text);
      }
    } catch {
      // Ignore JSON parse errors
    }

    const message = errorData.error || `API request failed: ${response.status}`;

    switch (response.status) {
      case 401:
        throw new MantleAuthenticationError(message);
      case 403:
        throw new MantlePermissionError(message);
      case 404:
        throw new MantleAPIError(message, 404, errorData.details);
      case 422:
        throw new MantleValidationError(message, errorData.details);
      case 429: {
        const retryAfter = response.headers.get('Retry-After');
        throw new MantleRateLimitError(
          message,
          retryAfter ? parseInt(retryAfter, 10) : undefined
        );
      }
      default:
        throw new MantleAPIError(message, response.status, errorData.details);
    }
  }
}
