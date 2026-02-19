import type { components } from '../generated/api';

// Core entities
export type Customer = components['schemas']['Customer'];
export type Contact = components['schemas']['Contact'];
export type Company = components['schemas']['Company'];
export type Deal = components['schemas']['Deal'];
export type DealFlow = components['schemas']['DealFlow'];
export type DealStage = components['schemas']['DealStage'];
export type DealActivity = components['schemas']['DealActivity'];
export type DealEvent = components['schemas']['DealEvent'];
export type Task = components['schemas']['Task'];
export type TaskTodoItem = components['schemas']['TaskTodoItem'];

// Apps & Billing
export type App = components['schemas']['App'];
export type Plan = components['schemas']['Plan'];
export type PlanFeature = components['schemas']['PlanFeature'];
export type Feature = components['schemas']['Feature'];
export type Subscription = components['schemas']['Subscription'];
export type Charge = components['schemas']['Charge'];
export type Transaction = components['schemas']['Transaction'];
export type UsageEvent = components['schemas']['UsageEvent'];
export type UsageMetric = components['schemas']['UsageMetric'];
export type AppEvent = components['schemas']['AppEvent'];
export type Review = components['schemas']['Review'];

// Support
export type Ticket = components['schemas']['Ticket'];
export type TicketMessage = components['schemas']['TicketMessage'];
export type TicketEvent = components['schemas']['TicketEvent'];

// CRM
export type AccountOwner = components['schemas']['AccountOwner'];
export type CustomField = components['schemas']['CustomField'];
export type CustomerSegment = components['schemas']['CustomerSegment'];
export type TimelineComment = components['schemas']['TimelineComment'];

// Affiliates
export type Affiliate = components['schemas']['Affiliate'];
export type AffiliateProgram = components['schemas']['AffiliateProgram'];
export type AffiliateCommission = components['schemas']['AffiliateCommission'];
export type AffiliatePayout = components['schemas']['AffiliatePayout'];
export type AffiliateReferral = components['schemas']['AffiliateReferral'];

// Docs
export type DocsCollection = components['schemas']['DocsCollection'];
export type DocsGroup = components['schemas']['DocsGroup'];
export type DocsPage = components['schemas']['DocsPage'];
export type DocsRepository = components['schemas']['DocsRepository'];

// Meetings
export type Meeting = components['schemas']['Meeting'];
export type MeetingAttendee = components['schemas']['MeetingAttendee'];
export type MeetingTranscript = components['schemas']['MeetingTranscript'];
export type MeetingUtterance = components['schemas']['MeetingUtterance'];

// Flows & Extensions
export type Flow = components['schemas']['Flow'];
export type FlowActionRun = components['schemas']['FlowActionRun'];

// Email
export type EmailUnsubscribeGroup = components['schemas']['EmailUnsubscribeGroup'];
export type EmailUnsubscribeGroupMember = components['schemas']['EmailUnsubscribeGroupMember'];

// Lists & Entities
export type List = components['schemas']['List'];
export type JournalEntry = components['schemas']['JournalEntry'];

// Platform
export type Organization = components['schemas']['Organization'];
export type User = components['schemas']['User'];
export type Webhook = components['schemas']['Webhook'];
export type AgentRun = components['schemas']['AgentRun'];

// Pagination
export type Pagination = components['schemas']['Pagination'];
export type CursorPagination = components['schemas']['CursorPagination'];
