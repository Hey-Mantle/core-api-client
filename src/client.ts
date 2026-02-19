import createClient from 'openapi-fetch';
import type { Client, Middleware } from 'openapi-fetch';
import type { paths } from './generated/api';
import type { MantleCoreClientConfig } from './types/common';

/**
 * Fallback for runtimes that don't support AbortSignal.timeout() (e.g. Node &lt; 18.17).
 * Returns an AbortSignal that aborts after the given ms.
 */
function createTimeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

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
import { CustomDataResource } from './resources/custom-data';
import { TimelineCommentsResource } from './resources/timelineComments';
import { ListsResource } from './resources/lists';
import { JournalEntriesResource } from './resources/journal-entries';
import { EmailUnsubscribeGroupsResource } from './resources/email-unsubscribe-groups';
import { FlowExtensionsResource } from './resources/flow-extensions';
import { AiAgentRunsResource } from './resources/ai-agent-runs';
import { MeetingsResource } from './resources/meetings';
import { SyncedEmailsResource } from './resources/synced-emails';

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
 * const { customer } = await client.customers.get('cust_123');
 * ```
 */
export class MantleCoreClient {
  /** @internal — used by resources to access the openapi-fetch client */
  readonly _api: Client<paths>;
  private apiKey?: string;
  private accessToken?: string;

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
  public readonly customData: CustomDataResource;
  public readonly timelineComments: TimelineCommentsResource;
  public readonly lists: ListsResource;
  public readonly journalEntries: JournalEntriesResource;
  public readonly emailUnsubscribeGroups: EmailUnsubscribeGroupsResource;
  public readonly flowExtensions: FlowExtensionsResource;
  public readonly aiAgentRuns: AiAgentRunsResource;
  public readonly meetings: MeetingsResource;
  public readonly syncedEmails: SyncedEmailsResource;

  constructor(config: MantleCoreClientConfig) {
    if (!config.apiKey && !config.accessToken && !config.fetch) {
      throw new Error(
        'MantleCoreClient requires either apiKey, accessToken, or a custom fetch function'
      );
    }

    this.apiKey = config.apiKey;
    this.accessToken = config.accessToken;

    const timeoutMs = config.timeout ?? 30000;

    this._api = createClient<paths>({
      baseUrl: config.baseURL || 'https://api.heymantle.com/v1',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(config.fetch ? { fetch: config.fetch } : {}),
    });

    // Auth middleware (always first)
    this._api.use({
      onRequest: ({ request }) => {
        const token = this.accessToken || this.apiKey;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        return request;
      },
    });

    // Timeout middleware: enforce request timeout via AbortSignal
    if (timeoutMs > 0) {
      this._api.use({
        onRequest: ({ request }) => {
          const signal =
            typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
              ? AbortSignal.timeout(timeoutMs)
              : createTimeoutSignal(timeoutMs);
          return new Request(request, { signal });
        },
      });
    }

    // User-provided middleware
    if (config.middleware) {
      for (const mw of config.middleware) {
        this._api.use(mw);
      }
    }

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
    this.customData = new CustomDataResource(this);
    this.timelineComments = new TimelineCommentsResource(this);
    this.lists = new ListsResource(this);
    this.journalEntries = new JournalEntriesResource(this);
    this.emailUnsubscribeGroups = new EmailUnsubscribeGroupsResource(this);
    this.flowExtensions = new FlowExtensionsResource(this);
    this.aiAgentRuns = new AiAgentRunsResource(this);
    this.meetings = new MeetingsResource(this);
    this.syncedEmails = new SyncedEmailsResource(this);
  }

  /**
   * Register an openapi-fetch middleware
   */
  use(middleware: Middleware): this {
    this._api.use(middleware);
    return this;
  }

  /**
   * Remove a registered middleware
   */
  eject(middleware: Middleware): this {
    this._api.eject(middleware);
    return this;
  }

  /**
   * Update authentication credentials
   */
  updateAuth(credentials: { apiKey?: string; accessToken?: string }): void {
    if (credentials.apiKey !== undefined) {
      this.apiKey = credentials.apiKey;
    }
    if (credentials.accessToken !== undefined) {
      this.accessToken = credentials.accessToken;
    }
  }
}
