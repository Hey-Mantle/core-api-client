import { BaseResource } from './base';
import type {
  AffiliateProgram,
  AffiliateProgramCreateParams,
  AffiliateProgramUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing affiliate programs
 */
export class AffiliateProgramsResource extends BaseResource {
  /**
   * List all affiliate programs
   */
  async list(): Promise<{ affiliatePrograms: AffiliateProgram[] }> {
    return this.get<{ affiliatePrograms: AffiliateProgram[] }>(
      '/affiliate_programs'
    );
  }

  /**
   * Retrieve a single affiliate program by ID
   */
  async retrieve(
    programId: string
  ): Promise<{ affiliateProgram: AffiliateProgram }> {
    return this.get<{ affiliateProgram: AffiliateProgram }>(
      `/affiliate_programs/${programId}`
    );
  }

  /**
   * Create a new affiliate program
   */
  async create(
    data: AffiliateProgramCreateParams
  ): Promise<{ affiliateProgram: AffiliateProgram }> {
    return this.post<{ affiliateProgram: AffiliateProgram }>(
      '/affiliate_programs',
      data
    );
  }

  /**
   * Update an existing affiliate program
   */
  async update(
    programId: string,
    data: AffiliateProgramUpdateParams
  ): Promise<{ affiliateProgram: AffiliateProgram }> {
    return this.put<{ affiliateProgram: AffiliateProgram }>(
      `/affiliate_programs/${programId}`,
      data
    );
  }

  /**
   * Delete an affiliate program
   */
  async del(programId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/affiliate_programs/${programId}`);
  }
}
