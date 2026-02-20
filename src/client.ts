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

// @generated-resource-imports-start
import { AffiliateCommissionsResource } from './resources/affiliate-commissions';
import { AffiliatePayoutsResource } from './resources/affiliate-payouts';
import { AffiliateProgramsResource } from './resources/affiliate-programs';
import { AffiliateReferralsResource } from './resources/affiliate-referrals';
import { AffiliatesResource } from './resources/affiliates';
import { AiAgentRunsResource } from './resources/ai-agent-runs';
import { AppsResource } from './resources/apps';
import { AssistantResource } from './resources/assistant';
import { ChannelsResource } from './resources/channels';
import { ChargesResource } from './resources/charges';
import { CompaniesResource } from './resources/companies';
import { ContactsResource } from './resources/contacts';
import { CustomDataResource } from './resources/custom-data';
import { CustomerSegmentsResource } from './resources/customer-segments';
import { CustomersResource } from './resources/customers';
import { DealActivitiesResource } from './resources/deal-activities';
import { DealFlowsResource } from './resources/deal-flows';
import { DealsResource } from './resources/deals';
import { DocsResource } from './resources/docs';
import { EmailUnsubscribeGroupsResource } from './resources/email-unsubscribe-groups';
import { EntitiesResource } from './resources/entities';
import { FlowExtensionsResource } from './resources/flow-extensions';
import { FlowsResource } from './resources/flows';
import { JournalEntriesResource } from './resources/journal-entries';
import { ListsResource } from './resources/lists';
import { MeetingsResource } from './resources/meetings';
import { MeResource } from './resources/me';
import { MetricsResource } from './resources/metrics';
import { OrganizationResource } from './resources/organization';
import { SubscriptionsResource } from './resources/subscriptions';
import { SyncedEmailsResource } from './resources/synced-emails';
import { TasksResource } from './resources/tasks';
import { TicketsResource } from './resources/tickets';
import { TimelineCommentsResource } from './resources/timeline-comments';
import { TransactionsResource } from './resources/transactions';
import { UsageEventsResource } from './resources/usage-events';
import { UsersResource } from './resources/users';
import { WebhooksResource } from './resources/webhooks';
import { AgentsResource } from './resources/agents';
// @generated-resource-imports-end

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

  // @generated-resource-properties-start
  public readonly affiliateCommissions: AffiliateCommissionsResource;
  public readonly affiliatePayouts: AffiliatePayoutsResource;
  public readonly affiliatePrograms: AffiliateProgramsResource;
  public readonly affiliateReferrals: AffiliateReferralsResource;
  public readonly affiliates: AffiliatesResource;
  public readonly aiAgentRuns: AiAgentRunsResource;
  public readonly apps: AppsResource;
  public readonly assistant: AssistantResource;
  public readonly channels: ChannelsResource;
  public readonly charges: ChargesResource;
  public readonly companies: CompaniesResource;
  public readonly contacts: ContactsResource;
  public readonly customData: CustomDataResource;
  public readonly customerSegments: CustomerSegmentsResource;
  public readonly customers: CustomersResource;
  public readonly dealActivities: DealActivitiesResource;
  public readonly dealFlows: DealFlowsResource;
  public readonly deals: DealsResource;
  public readonly docs: DocsResource;
  public readonly emailUnsubscribeGroups: EmailUnsubscribeGroupsResource;
  public readonly entities: EntitiesResource;
  public readonly flowExtensions: FlowExtensionsResource;
  public readonly flows: FlowsResource;
  public readonly journalEntries: JournalEntriesResource;
  public readonly lists: ListsResource;
  public readonly meetings: MeetingsResource;
  public readonly me: MeResource;
  public readonly metrics: MetricsResource;
  public readonly organization: OrganizationResource;
  public readonly subscriptions: SubscriptionsResource;
  public readonly syncedEmails: SyncedEmailsResource;
  public readonly tasks: TasksResource;
  public readonly tickets: TicketsResource;
  public readonly timelineComments: TimelineCommentsResource;
  public readonly transactions: TransactionsResource;
  public readonly usageEvents: UsageEventsResource;
  public readonly users: UsersResource;
  public readonly webhooks: WebhooksResource;
  public readonly agents: AgentsResource;
  // @generated-resource-properties-end

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

    // @generated-resource-instantiations-start
    this.affiliateCommissions = new AffiliateCommissionsResource(this);
    this.affiliatePayouts = new AffiliatePayoutsResource(this);
    this.affiliatePrograms = new AffiliateProgramsResource(this);
    this.affiliateReferrals = new AffiliateReferralsResource(this);
    this.affiliates = new AffiliatesResource(this);
    this.aiAgentRuns = new AiAgentRunsResource(this);
    this.apps = new AppsResource(this);
    this.assistant = new AssistantResource(this);
    this.channels = new ChannelsResource(this);
    this.charges = new ChargesResource(this);
    this.companies = new CompaniesResource(this);
    this.contacts = new ContactsResource(this);
    this.customData = new CustomDataResource(this);
    this.customerSegments = new CustomerSegmentsResource(this);
    this.customers = new CustomersResource(this);
    this.dealActivities = new DealActivitiesResource(this);
    this.dealFlows = new DealFlowsResource(this);
    this.deals = new DealsResource(this);
    this.docs = new DocsResource(this);
    this.emailUnsubscribeGroups = new EmailUnsubscribeGroupsResource(this);
    this.entities = new EntitiesResource(this);
    this.flowExtensions = new FlowExtensionsResource(this);
    this.flows = new FlowsResource(this);
    this.journalEntries = new JournalEntriesResource(this);
    this.lists = new ListsResource(this);
    this.meetings = new MeetingsResource(this);
    this.me = new MeResource(this);
    this.metrics = new MetricsResource(this);
    this.organization = new OrganizationResource(this);
    this.subscriptions = new SubscriptionsResource(this);
    this.syncedEmails = new SyncedEmailsResource(this);
    this.tasks = new TasksResource(this);
    this.tickets = new TicketsResource(this);
    this.timelineComments = new TimelineCommentsResource(this);
    this.transactions = new TransactionsResource(this);
    this.usageEvents = new UsageEventsResource(this);
    this.users = new UsersResource(this);
    this.webhooks = new WebhooksResource(this);
    this.agents = new AgentsResource(this);
    // @generated-resource-instantiations-end
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
