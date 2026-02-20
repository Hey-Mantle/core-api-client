import openapiTS, { astToString } from 'openapi-typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPEC_URL = 'https://app.heymantle.com/openapi/core-api.json';
const ROOT = path.resolve(__dirname, '..');
const GENERATED_API = path.resolve(ROOT, 'src/generated/api.ts');
const RESOURCES_DIR = path.resolve(ROOT, 'src/resources');
const CLIENT_TS = path.resolve(ROOT, 'src/client.ts');
const RESOURCES_INDEX = path.resolve(ROOT, 'src/resources/index.ts');

// ─── Utilities ────────────────────────────────────────────────────────────────

function snakeToCamel(s: string): string {
  return s.replace(/[-_](.)/g, (_, c: string) => c.toUpperCase());
}

function toPascalCase(s: string): string {
  const c = snakeToCamel(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function singularize(word: string): string {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (/(ses|xes|zes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function looksPlural(s: string): boolean {
  return (s.endsWith('s') && !s.endsWith('ss')) || s.endsWith('ies');
}

const SINGLE_WORD_ACTIONS = new Set([
  'archive', 'unarchive', 'fire', 'accept', 'dismiss', 'analyze',
  'transcribe', 'upload', 'validate', 'publish', 'unpublish',
  'add', 'remove', 'enable', 'disable', 'activate', 'deactivate',
]);

function startsWithActionVerb(s: string): boolean {
  const firstWord = s.split(/[-_A-Z]/)[0].toLowerCase();
  return SINGLE_WORD_ACTIONS.has(firstWord) ||
    ['add', 'remove', 'set', 'get', 'list', 'create', 'update', 'delete'].includes(firstWord);
}

type Seg = { kind: 'param' | 'named'; val: string };

function parseSegs(suffix: string): Seg[] {
  return suffix.split('/').filter(Boolean).map(s =>
    s.startsWith('{') ? { kind: 'param', val: s.slice(1, -1) } : { kind: 'named', val: s }
  );
}

/**
 * Derive a method name from an HTTP method + path suffix relative to the resource prefix.
 * methodNaming='last-segment' is used for flat metric-style resources where each
 * path maps directly to a method named after its last segment.
 */
function deriveMethodName(
  httpMethod: string,
  suffix: string,
  primarySingular: string,
  allMethodsOnPath: string[],
  methodNaming: 'standard' | 'last-segment' = 'standard',
): string {
  const parsed = parseSegs(suffix);

  // Flat metric-style: just use the last named segment as the method name
  if (methodNaming === 'last-segment') {
    const namedSegs = parsed.filter(s => s.kind === 'named');
    if (namedSegs.length > 0) return snakeToCamel(namedSegs[namedSegs.length - 1].val);
  }

  if (parsed.length === 0) {
    return httpMethod === 'get' ? 'list' : 'create';
  }

  const lastSeg = parsed[parsed.length - 1];
  const namedSegs = parsed.filter(s => s.kind === 'named').map(s => s.val);

  // ── Ends with a path parameter → CRUD on a single resource ─────────────────
  if (lastSeg.kind === 'param') {
    if (namedSegs.length === 0) {
      // Root: /{id}
      const map: Record<string, string> = { get: 'get', put: 'update', patch: 'update', delete: 'del' };
      // Disambiguate when both PUT and PATCH exist on this path
      if (httpMethod === 'put' && allMethodsOnPath.includes('patch')) return 'replace';
      if (httpMethod === 'patch' && allMethodsOnPath.includes('put')) return 'update';
      return map[httpMethod] ?? httpMethod;
    }
    const subNoun = toPascalCase(singularize(namedSegs[namedSegs.length - 1]));
    if (httpMethod === 'put' && allMethodsOnPath.includes('patch')) return `replace${subNoun}`;
    if (httpMethod === 'patch' && allMethodsOnPath.includes('put')) return `update${subNoun}`;
    const map: Record<string, string> = {
      get: `get${subNoun}`, put: `update${subNoun}`, patch: `update${subNoun}`,
      delete: `delete${subNoun}`, post: `create${subNoun}`,
    };
    return map[httpMethod] ?? `${httpMethod}${subNoun}`;
  }

  // ── Ends with a named segment ───────────────────────────────────────────────
  const lastNamed = lastSeg.val;
  const isMultiWord = /[A-Z]/.test(lastNamed) || lastNamed.includes('-');

  // Find the nearest preceding named segment (skipping params) for context
  const lastIdx = parsed.lastIndexOf(lastSeg);
  let contextNoun = '';
  for (let i = lastIdx - 1; i >= 0; i--) {
    if (parsed[i].kind === 'named') { contextNoun = parsed[i].val; break; }
  }

  if (isMultiWord) {
    // camelCase (addTags) or kebab-case (recording-url, validate-schema)
    if (startsWithActionVerb(lastNamed)) return snakeToCamel(lastNamed); // verb phrase → use as-is
    // noun phrase → prefix with HTTP verb
    const noun = toPascalCase(lastNamed);
    if (httpMethod === 'get') return `get${noun}`;
    if (httpMethod === 'post') return `create${noun}`;
    return `${httpMethod}${noun}`;
  }

  if (SINGLE_WORD_ACTIONS.has(lastNamed)) {
    // Single-word action verb, possibly with a context noun suffix
    if (contextNoun && !SINGLE_WORD_ACTIONS.has(contextNoun)) {
      // e.g. archive after plans/{planId} → archivePlan
      return `${lastNamed}${toPascalCase(singularize(contextNoun))}`;
    }
    if (contextNoun && SINGLE_WORD_ACTIONS.has(contextNoun)) {
      // e.g. upload after transcribe → transcribeUpload
      return `${snakeToCamel(contextNoun)}${toPascalCase(lastNamed)}`;
    }
    return lastNamed;
  }

  // Regular noun segment
  if (looksPlural(lastNamed)) {
    const singular = toPascalCase(singularize(lastNamed));
    const plural = toPascalCase(lastNamed);
    const map: Record<string, string> = {
      get: `list${plural}`, post: `create${singular}`,
      put: `update${singular}`, patch: `update${singular}`,
      delete: `delete${singular}`,
    };
    return map[httpMethod] ?? `${httpMethod}${plural}`;
  } else {
    const noun = toPascalCase(lastNamed);
    const map: Record<string, string> = {
      get: `get${noun}`, post: `create${noun}`,
      put: `update${noun}`, patch: `update${noun}`,
      delete: `delete${noun}`,
    };
    return map[httpMethod] ?? `${httpMethod}${noun}`;
  }
}

// ─── Spec helpers ─────────────────────────────────────────────────────────────

function resolveParam(spec: Record<string, unknown>, paramOrRef: Record<string, unknown>): Record<string, unknown> {
  if (paramOrRef.$ref) {
    const refName = (paramOrRef.$ref as string).split('/').pop()!;
    return ((spec.components as Record<string, unknown>).parameters as Record<string, unknown>)[refName] as Record<string, unknown>;
  }
  return paramOrRef;
}

function getQueryInfo(spec: Record<string, unknown>, pathStr: string, method: string): { hasQuery: boolean; queryRequired: boolean } {
  const pathDef = (spec.paths as Record<string, Record<string, unknown>>)[pathStr];
  const pathLevel = (pathDef.parameters as unknown[] | undefined) ?? [];
  const opLevel = ((pathDef[method] as Record<string, unknown>)?.parameters as unknown[] | undefined) ?? [];
  const all = [...pathLevel, ...opLevel].map(p => resolveParam(spec, p as Record<string, unknown>));
  const queryParams = all.filter(p => p.in === 'query');
  return {
    hasQuery: queryParams.length > 0,
    queryRequired: queryParams.some(p => p.required === true),
  };
}

function getBodyInfo(spec: Record<string, unknown>, pathStr: string, method: string): { hasBody: boolean; bodyRequired: boolean } {
  const op = ((spec.paths as Record<string, Record<string, unknown>>)[pathStr][method] as Record<string, unknown>);
  const rb = op?.requestBody as Record<string, unknown> | undefined;
  return { hasBody: !!rb, bodyRequired: rb?.required !== false };
}

// ─── Method param derivation ──────────────────────────────────────────────────

interface PathParam { specName: string; paramName: string }

function extractPathParams(pathStr: string, resourcePrefix: string, primarySingular: string): PathParam[] {
  // Only the params that appear AFTER the resource prefix in the path
  const suffix = pathStr.slice(resourcePrefix.length);
  const matches = [...suffix.matchAll(/\{([^}]+)\}/g)];
  return matches.map(m => {
    const specName = m[1];
    let paramName = snakeToCamel(specName);
    if (specName === 'id') paramName = `${snakeToCamel(primarySingular)}Id`;
    return { specName, paramName };
  });
}

// ─── Method code generation ───────────────────────────────────────────────────

function generateMethod(
  spec: Record<string, unknown>,
  httpMethod: string,
  pathStr: string,
  resourcePrefix: string,
  primarySingular: string,
  allMethodsOnPath: string[],
  methodNaming: 'standard' | 'last-segment',
  methodNameOverride?: string,
): string {
  const suffix = pathStr.slice(resourcePrefix.length);
  const methodName = methodNameOverride ?? deriveMethodName(httpMethod, suffix, primarySingular, allMethodsOnPath, methodNaming);
  const pathParams = extractPathParams(pathStr, resourcePrefix, primarySingular);
  const { hasQuery, queryRequired } = getQueryInfo(spec, pathStr, httpMethod);
  const { hasBody, bodyRequired } = getBodyInfo(spec, pathStr, httpMethod);

  // Build argument list
  const args: string[] = pathParams.map(p => `${p.paramName}: string`);

  let queryType = '';
  if (hasQuery) {
    queryType = `paths['${pathStr}']['${httpMethod}']['parameters']['query']`;
    args.push(`params${queryRequired ? '' : '?'}: ${queryType}`);
  }

  let bodyTypeStr = '';
  if (hasBody) {
    const rb = `paths['${pathStr}']['${httpMethod}']['requestBody']`;
    // Always use NonNullable<> — openapi-typescript may generate requestBody as optional
    // even when the spec marks it required, so this is the safe universal form.
    bodyTypeStr = `NonNullable<${rb}>['content']['application/json']`;
    args.push(`data${bodyRequired ? '' : '?'}: ${bodyTypeStr}`);
  }

  // Build API call
  const HTTP = httpMethod.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  const callParts: string[] = [];

  if (pathParams.length > 0) {
    const pathObj = pathParams
      .map(p => p.specName === p.paramName ? p.paramName : `${p.specName}: ${p.paramName}`)
      .join(', ');
    let pathEntry = `path: { ${pathObj} }`;
    if (hasQuery) pathEntry += `, query: params`;
    callParts.push(`params: { ${pathEntry} }`);
  } else if (hasQuery) {
    callParts.push(`params: { query: params }`);
  }

  if (hasBody) callParts.push(`body: data`);

  const callArg = callParts.length > 0 ? `, { ${callParts.join(', ')} }` : '';

  return `
  async ${methodName}(${args.join(', ')}) {
    return this.unwrap(this.api.${HTTP}('${pathStr}'${callArg}));
  }`;
}

// ─── Resource group config ────────────────────────────────────────────────────

interface ResourceGroup {
  /** kebab-case filename without .ts */
  file: string;
  className: string;
  /** camelCase property name on MantleCoreClient */
  clientProp: string;
  /** singular name used to rename generic {id} params */
  singularName: string;
  /** spec paths starting with these prefixes belong to this resource */
  pathPrefixes: string[];
  /** if true, skip generating the file (hand-written resource) */
  manual?: boolean;
  /** 'last-segment' for flat resources like metrics where method name = last path segment */
  methodNaming?: 'standard' | 'last-segment';
  /** rename specific generated method names */
  methodOverrides?: Record<string, string>;
  /** verbatim extra methods appended inside the class */
  customMethods?: string;
}

const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    file: 'affiliate-commissions', className: 'AffiliateCommissionsResource',
    clientProp: 'affiliateCommissions', singularName: 'commission',
    pathPrefixes: ['/affiliate_commissions'],
  },
  {
    file: 'affiliate-payouts', className: 'AffiliatePayoutsResource',
    clientProp: 'affiliatePayouts', singularName: 'payout',
    pathPrefixes: ['/affiliate_payouts'],
  },
  {
    file: 'affiliate-programs', className: 'AffiliateProgramsResource',
    clientProp: 'affiliatePrograms', singularName: 'program',
    pathPrefixes: ['/affiliate_programs'],
  },
  {
    file: 'affiliate-referrals', className: 'AffiliateReferralsResource',
    clientProp: 'affiliateReferrals', singularName: 'referral',
    pathPrefixes: ['/affiliate_referrals'],
  },
  {
    file: 'affiliates', className: 'AffiliatesResource',
    clientProp: 'affiliates', singularName: 'affiliate',
    pathPrefixes: ['/affiliates'],
  },
  {
    file: 'ai-agent-runs', className: 'AiAgentRunsResource',
    clientProp: 'aiAgentRuns', singularName: 'run',
    pathPrefixes: ['/ai/agents'],
    // The sub-collection is "runs" but this resource IS the runs resource, so
    // strip the noun suffix from the top-level CRUD methods.
    methodOverrides: { listRuns: 'list', createRun: 'create', getRun: 'get' },
    customMethods: `
  /**
   * Create an agent run and poll until it reaches a terminal status.
   */
  async createAndWait(
    agentId: string,
    data?: paths['/ai/agents/{agentId}/runs']['post']['requestBody']['content']['application/json'],
    options?: { timeout?: number; pollInterval?: number },
  ): Promise<components['schemas']['AgentRun']> {
    const { timeout = 300_000, pollInterval = 2_000 } = options ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.create(agentId, data as any);
    const run = (result as { run: components['schemas']['AgentRun'] }).run;
    if (!run?.id) throw new Error('Agent run ID not returned');
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const response = await this.get(agentId, run.id);
      const agentRun = (response as { run: components['schemas']['AgentRun'] }).run;
      if (agentRun.status === 'completed' || agentRun.status === 'error') return agentRun;
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    throw new Error(\`Agent run timed out after \${timeout}ms\`);
  }`,
  },
  {
    file: 'apps', className: 'AppsResource',
    clientProp: 'apps', singularName: 'app',
    pathPrefixes: ['/apps'],
  },
  {
    file: 'assistant', className: 'AssistantResource',
    clientProp: 'assistant', singularName: 'conversation',
    pathPrefixes: ['/assistant'],
  },
  {
    file: 'channels', className: 'ChannelsResource',
    clientProp: 'channels', singularName: 'channel',
    pathPrefixes: ['/channels'],
  },
  {
    file: 'charges', className: 'ChargesResource',
    clientProp: 'charges', singularName: 'charge',
    pathPrefixes: ['/charges'],
  },
  {
    file: 'companies', className: 'CompaniesResource',
    clientProp: 'companies', singularName: 'company',
    pathPrefixes: ['/companies'],
  },
  {
    file: 'contacts', className: 'ContactsResource',
    clientProp: 'contacts', singularName: 'contact',
    pathPrefixes: ['/contacts'],
  },
  {
    file: 'custom-data', className: 'CustomDataResource',
    clientProp: 'customData', singularName: 'customData',
    pathPrefixes: ['/custom_data'],
    // GET /custom_data → 'list' by algorithm; semantic override
    methodOverrides: { list: 'getValue', create: 'set' },
  },
  {
    file: 'customer-segments', className: 'CustomerSegmentsResource',
    clientProp: 'customerSegments', singularName: 'segment',
    pathPrefixes: ['/customer_segments'],
  },
  {
    file: 'customers', className: 'CustomersResource',
    clientProp: 'customers', singularName: 'customer',
    pathPrefixes: ['/customers'],
  },
  {
    file: 'deal-activities', className: 'DealActivitiesResource',
    clientProp: 'dealActivities', singularName: 'activity',
    pathPrefixes: ['/deal_activities'],
  },
  {
    file: 'deal-flows', className: 'DealFlowsResource',
    clientProp: 'dealFlows', singularName: 'dealFlow',
    pathPrefixes: ['/deal_flows'],
  },
  {
    file: 'deals', className: 'DealsResource',
    clientProp: 'deals', singularName: 'deal',
    pathPrefixes: ['/deals'],
  },
  {
    file: 'docs', className: 'DocsResource',
    clientProp: 'docs', singularName: 'doc',
    pathPrefixes: ['/docs'],
  },
  {
    file: 'email-unsubscribe-groups', className: 'EmailUnsubscribeGroupsResource',
    clientProp: 'emailUnsubscribeGroups', singularName: 'group',
    pathPrefixes: ['/email/unsubscribe_groups'],
  },
  {
    file: 'entities', className: 'EntitiesResource',
    clientProp: 'entities', singularName: 'entity',
    pathPrefixes: ['/entities'],
    // GET /entities is semantically a search, not a generic list
    methodOverrides: { list: 'search' },
  },
  {
    file: 'flow-extensions', className: 'FlowExtensionsResource',
    clientProp: 'flowExtensions', singularName: 'extension',
    // /flow/extensions/* for actions/triggers, /flow/actions/* for action runs
    pathPrefixes: ['/flow/extensions', '/flow/actions'],
  },
  {
    file: 'flows', className: 'FlowsResource',
    clientProp: 'flows', singularName: 'flow',
    pathPrefixes: ['/flows'],
  },
  {
    file: 'journal-entries', className: 'JournalEntriesResource',
    clientProp: 'journalEntries', singularName: 'entry',
    pathPrefixes: ['/journal_entries'],
  },
  {
    file: 'lists', className: 'ListsResource',
    clientProp: 'lists', singularName: 'list',
    pathPrefixes: ['/lists'],
  },
  {
    file: 'meetings', className: 'MeetingsResource',
    clientProp: 'meetings', singularName: 'meeting',
    pathPrefixes: ['/meetings'],
  },
  {
    // /me is not in the spec — hand-written
    file: 'me', className: 'MeResource',
    clientProp: 'me', singularName: 'me',
    pathPrefixes: [], manual: true,
  },
  {
    file: 'metrics', className: 'MetricsResource',
    clientProp: 'metrics', singularName: 'metric',
    pathPrefixes: ['/api/core/v1/metrics', '/metrics'],
    methodNaming: 'last-segment',
  },
  {
    file: 'organization', className: 'OrganizationResource',
    clientProp: 'organization', singularName: 'organization',
    pathPrefixes: ['/organization'],
  },
  {
    file: 'subscriptions', className: 'SubscriptionsResource',
    clientProp: 'subscriptions', singularName: 'subscription',
    pathPrefixes: ['/subscriptions'],
  },
  {
    file: 'synced-emails', className: 'SyncedEmailsResource',
    clientProp: 'syncedEmails', singularName: 'syncedEmail',
    pathPrefixes: ['/synced_emails'],
  },
  {
    file: 'tasks', className: 'TasksResource',
    clientProp: 'tasks', singularName: 'task',
    pathPrefixes: ['/tasks'],
  },
  {
    file: 'tickets', className: 'TicketsResource',
    clientProp: 'tickets', singularName: 'ticket',
    pathPrefixes: ['/tickets'],
  },
  {
    file: 'timeline-comments', className: 'TimelineCommentsResource',
    clientProp: 'timelineComments', singularName: 'comment',
    pathPrefixes: ['/timeline_comments'],
  },
  {
    file: 'transactions', className: 'TransactionsResource',
    clientProp: 'transactions', singularName: 'transaction',
    pathPrefixes: ['/transactions'],
  },
  {
    file: 'usage-events', className: 'UsageEventsResource',
    clientProp: 'usageEvents', singularName: 'event',
    pathPrefixes: ['/usage_events'],
  },
  {
    file: 'users', className: 'UsersResource',
    clientProp: 'users', singularName: 'user',
    pathPrefixes: ['/users'],
  },
  {
    file: 'webhooks', className: 'WebhooksResource',
    clientProp: 'webhooks', singularName: 'webhook',
    pathPrefixes: ['/webhooks'],
  },
  {
    // /agents is not in the spec — hand-written
    file: 'agents', className: 'AgentsResource',
    clientProp: 'agents', singularName: 'agent',
    pathPrefixes: [], manual: true,
  },
];

// ─── Resource file generation ─────────────────────────────────────────────────

function findResourceGroup(pathStr: string): ResourceGroup | undefined {
  // Longest matching prefix wins; require prefix to be followed by / or end of string
  let best: ResourceGroup | undefined;
  let bestLen = -1;
  for (const group of RESOURCE_GROUPS) {
    for (const prefix of group.pathPrefixes) {
      if ((pathStr === prefix || pathStr.startsWith(prefix + '/')) && prefix.length > bestLen) {
        best = group;
        bestLen = prefix.length;
      }
    }
  }
  return best;
}

function generateResourceFile(group: ResourceGroup, spec: Record<string, unknown>): string {
  const paths = spec.paths as Record<string, Record<string, unknown>>;
  const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

  // Gather all (path, method) pairs for this resource group, sorted by path then method
  const entries: Array<{ pathStr: string; method: string; prefix: string }> = [];
  for (const [pathStr, def] of Object.entries(paths)) {
    const group_ = findResourceGroup(pathStr);
    if (group_?.file !== group.file) continue;
    const matchedPrefix = group.pathPrefixes
      .filter(p => pathStr === p || pathStr.startsWith(p + '/'))
      .sort((a, b) => b.length - a.length)[0];
    for (const method of HTTP_METHODS) {
      if (def[method]) entries.push({ pathStr, method, prefix: matchedPrefix });
    }
  }

  if (entries.length === 0 && !group.customMethods) return '';

  // Deduplicate method names — if two ops on the same path yield the same name, suffix with HTTP method
  const methodNameCounts = new Map<string, number>();
  const resolvedNames = new Map<string, string>();

  for (const { pathStr, method, prefix } of entries) {
    const allMethodsOnPath = HTTP_METHODS.filter(m => (paths[pathStr] as Record<string, unknown>)[m]).map(String);
    const suffix = pathStr.slice(prefix.length);
    const raw = deriveMethodName(method, suffix, group.singularName, allMethodsOnPath, group.methodNaming ?? 'standard');
    const name = group.methodOverrides?.[raw] ?? raw;
    const key = `${pathStr}::${method}`;
    methodNameCounts.set(name, (methodNameCounts.get(name) ?? 0) + 1);
    resolvedNames.set(key, name);
  }

  // For any collision, append HTTP method suffix
  const finalNames = new Map<string, string>();
  const seen = new Map<string, number>();
  for (const { pathStr, method, prefix } of entries) {
    const key = `${pathStr}::${method}`;
    const name = resolvedNames.get(key)!;
    const count = methodNameCounts.get(name) ?? 1;
    if (count > 1) {
      const deduped = `${name}${toPascalCase(method)}`;
      finalNames.set(key, deduped);
    } else {
      finalNames.set(key, name);
    }
    seen.set(name, (seen.get(name) ?? 0) + 1);
  }

  // Generate method code
  const methods: string[] = [];
  const usedNames = new Set<string>();
  for (const { pathStr, method, prefix } of entries) {
    const key = `${pathStr}::${method}`;
    const methodName = finalNames.get(key)!;
    if (usedNames.has(methodName)) continue; // already generated (shouldn't happen post-dedup)
    usedNames.add(methodName);

    const allMethodsOnPath = HTTP_METHODS.filter(m => (paths[pathStr] as Record<string, unknown>)[m]).map(String);
    const suffix = pathStr.slice(prefix.length);
    const rawName = deriveMethodName(method, suffix, group.singularName, allMethodsOnPath, group.methodNaming ?? 'standard');
    const overrideName = group.methodOverrides?.[rawName] ?? rawName;
    // Pass the final method name as override so the generator uses it
    methods.push(generateMethod(spec, method, pathStr, prefix, group.singularName, allMethodsOnPath, group.methodNaming ?? 'standard', methodName));
  }

  const needsPaths = methods.some(m => m.includes("paths['")) || group.customMethods?.includes("paths['");
  const needsComponents = group.customMethods?.includes('components[');
  const importsLine = needsPaths || needsComponents
    ? `import type { ${[needsPaths && 'paths', needsComponents && 'components'].filter(Boolean).join(', ')} } from '../generated/api';`
    : '';

  const classBody = methods.join('\n') + (group.customMethods ?? '');

  const typeImportLine = importsLine ? `\n${importsLine}` : '';
  return `// Auto-generated by scripts/generate.ts — DO NOT EDIT
import { BaseResource } from './base';${typeImportLine}

export class ${group.className} extends BaseResource {${classBody}
}
`;
}

// ─── resources/index.ts generation ───────────────────────────────────────────

function generateIndex(groups: ResourceGroup[]): string {
  const exports = groups
    .map(g => `export { ${g.className} } from './${g.file}';`)
    .join('\n');
  return `// Auto-generated by scripts/generate.ts — DO NOT EDIT\nexport { BaseResource } from './base';\n${exports}\n`;
}

// ─── client.ts section patching ───────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patchClientSection(content: string, marker: string, newSection: string): string {
  const startTag = `// @generated-${marker}-start`;
  const endTag = `// @generated-${marker}-end`;
  // Capture leading whitespace so end marker stays at the same indent level
  const re = new RegExp(`([ \\t]*)${escapeRegex(startTag)}[\\s\\S]*?[ \\t]*${escapeRegex(endTag)}`, 'm');
  return content.replace(re, (_, indent: string) =>
    `${indent}${startTag}\n${newSection}\n${indent}${endTag}`
  );
}

function buildClientImports(groups: ResourceGroup[]): string {
  return groups.map(g => `import { ${g.className} } from './resources/${g.file}';`).join('\n');
}

function buildClientProperties(groups: ResourceGroup[]): string {
  return groups.map(g => `  public readonly ${g.clientProp}: ${g.className};`).join('\n');
}

function buildClientInstantiations(groups: ResourceGroup[]): string {
  return groups.map(g => `    this.${g.clientProp} = new ${g.className}(this);`).join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── 1. Fetch spec ─────────────────────────────────────────────────────────
  console.log('Fetching OpenAPI spec from', SPEC_URL);
  const response = await fetch(SPEC_URL);
  if (!response.ok) throw new Error(`Failed to fetch spec: ${response.status} ${response.statusText}`);
  const spec = await response.json() as Record<string, unknown>;

  // ── 2. Generate src/generated/api.ts ──────────────────────────────────────
  console.log('Generating TypeScript types…');
  const ast = await openapiTS(spec, { exportType: true, alphabetize: true });
  const output = astToString(ast);
  const header = `// Auto-generated by scripts/generate.ts — DO NOT EDIT\n// Source: ${SPEC_URL}\n// Generated: ${new Date().toISOString()}\n\n`;
  fs.mkdirSync(path.dirname(GENERATED_API), { recursive: true });
  fs.writeFileSync(GENERATED_API, header + output);
  console.log(`  Written ${GENERATED_API}`);

  // ── 3. Generate resource files ────────────────────────────────────────────
  console.log('Generating resource files…');
  const activeGroups = RESOURCE_GROUPS.filter(g => !g.manual);

  // Remove the old camelCase timelineComments file if we're writing the kebab version
  const oldCamelCase = path.join(RESOURCES_DIR, 'timelineComments.ts');
  if (fs.existsSync(oldCamelCase)) {
    fs.unlinkSync(oldCamelCase);
    console.log('  Removed legacy timelineComments.ts (replaced by timeline-comments.ts)');
  }

  for (const group of activeGroups) {
    const content = generateResourceFile(group, spec);
    if (!content) {
      console.warn(`  Warning: no spec paths found for ${group.file}, skipping`);
      continue;
    }
    const dest = path.join(RESOURCES_DIR, `${group.file}.ts`);
    fs.writeFileSync(dest, content);
    console.log(`  Written ${dest}`);
  }

  // ── 4. Generate src/resources/index.ts ───────────────────────────────────
  console.log('Generating resources/index.ts…');
  fs.writeFileSync(RESOURCES_INDEX, generateIndex(RESOURCE_GROUPS));

  // ── 5. Patch src/client.ts ────────────────────────────────────────────────
  console.log('Patching client.ts…');
  let client = fs.readFileSync(CLIENT_TS, 'utf8');
  client = patchClientSection(client, 'resource-imports', buildClientImports(RESOURCE_GROUPS));
  client = patchClientSection(client, 'resource-properties', buildClientProperties(RESOURCE_GROUPS));
  client = patchClientSection(client, 'resource-instantiations', buildClientInstantiations(RESOURCE_GROUPS));
  fs.writeFileSync(CLIENT_TS, client);

  // ── 6. Typecheck ──────────────────────────────────────────────────────────
  console.log('Running typecheck…');
  const tsc = spawnSync('npx', ['tsc', '--noEmit'], {
    cwd: ROOT, stdio: 'inherit', shell: true,
  });
  if (tsc.status !== 0) {
    console.error(
      '\n❌ Typecheck failed — fix the errors above, then commit alongside the regenerated files.',
    );
    process.exit(1);
  }

  console.log('✅ Generation complete and typecheck passed.');
}

main().catch(e => { console.error(e); process.exit(1); });
