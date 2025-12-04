import type { ListParams, PaginatedResponse } from './common';

/**
 * Affiliate entity
 */
export interface Affiliate {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  affiliateProgramId: string;
  appId?: string;
  commissionRate?: number;
  referralCode?: string;
  referralUrl?: string;
  paypalEmail?: string;
  totalReferrals?: number;
  totalCommissions?: number;
  unpaidCommissions?: number;
  createdAt: string;
  updatedAt: string;
  affiliateProgram?: {
    id: string;
    name: string;
  };
}

/**
 * Parameters for listing affiliates
 */
export interface AffiliateListParams extends ListParams {
  affiliateProgramId?: string;
  status?: 'pending' | 'active' | 'rejected' | 'suspended';
  appId?: string;
  email?: string;
}

/**
 * Response from listing affiliates
 */
export interface AffiliateListResponse extends PaginatedResponse {
  affiliates: Affiliate[];
}

/**
 * Parameters for updating an affiliate
 */
export interface AffiliateUpdateParams {
  status?: 'pending' | 'active' | 'rejected' | 'suspended';
  commissionRate?: number;
}

/**
 * Affiliate program entity
 */
export interface AffiliateProgram {
  id: string;
  name: string;
  description?: string;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  commissionDurationMonths?: number;
  cookieDurationDays?: number;
  minimumPayoutAmount?: number;
  payoutCurrency?: string;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating an affiliate program
 */
export interface AffiliateProgramCreateParams {
  name: string;
  description?: string;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  commissionDurationMonths?: number;
  cookieDurationDays?: number;
  minimumPayoutAmount?: number;
  payoutCurrency?: string;
  active?: boolean;
}

/**
 * Parameters for updating an affiliate program
 */
export interface AffiliateProgramUpdateParams
  extends Partial<AffiliateProgramCreateParams> {}

/**
 * Affiliate commission entity
 */
export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  referralId?: string;
  amount: number;
  currencyCode: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  affiliate?: {
    id: string;
    name?: string;
    email: string;
  };
}

/**
 * Parameters for listing affiliate commissions
 */
export interface AffiliateCommissionListParams extends ListParams {
  affiliateId?: string;
  status?: 'pending' | 'approved' | 'paid' | 'rejected';
}

/**
 * Response from listing affiliate commissions
 */
export interface AffiliateCommissionListResponse extends PaginatedResponse {
  commissions: AffiliateCommission[];
}

/**
 * Affiliate payout entity
 */
export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  amount: number;
  currencyCode: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  affiliate?: {
    id: string;
    name?: string;
    email: string;
  };
}

/**
 * Parameters for listing affiliate payouts
 */
export interface AffiliatePayoutListParams extends ListParams {
  affiliateId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Response from listing affiliate payouts
 */
export interface AffiliatePayoutListResponse extends PaginatedResponse {
  payouts: AffiliatePayout[];
}

/**
 * Affiliate referral entity
 */
export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  customerId?: string;
  subscriptionId?: string;
  status: 'pending' | 'converted' | 'expired';
  referredAt: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  affiliate?: {
    id: string;
    name?: string;
    email: string;
  };
  customer?: {
    id: string;
    name?: string;
  };
}

/**
 * Parameters for listing affiliate referrals
 */
export interface AffiliateReferralListParams extends ListParams {
  affiliateId?: string;
  status?: 'pending' | 'converted' | 'expired';
}

/**
 * Response from listing affiliate referrals
 */
export interface AffiliateReferralListResponse extends PaginatedResponse {
  referrals: AffiliateReferral[];
}
