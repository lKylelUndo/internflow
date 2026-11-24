import { findCompanyById } from '@/repositories/company.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { CompanyData } from '@/types/company';
import type { ServiceResponse } from '@/types/api';

export const getCompanyService = {
  execute: async (
    deanUserId: string,
    companyId: string,
  ): Promise<ServiceResponse<CompanyData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const company = await findCompanyById(companyId);
      if (!company || company.departmentId !== deanProfile.departmentId) {
        return { status: 'error', code: 404, message: 'Company not found' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Company retrieved successfully',
        data: { company },
      };
    } catch (error) {
      console.error('getCompanyService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve company' };
    }
  },
};
