import { findCompaniesByDepartment } from '@/repositories/company.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { ListCompaniesData } from '@/types/company';
import type { ServiceResponse } from '@/types/api';

export const listCompaniesService = {
  execute: async (deanUserId: string): Promise<ServiceResponse<ListCompaniesData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const companies = await findCompaniesByDepartment(deanProfile.departmentId);

      return {
        status: 'success',
        code: 200,
        message: 'Companies retrieved successfully',
        data: { companies },
      };
    } catch (error) {
      console.error('listCompaniesService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve companies' };
    }
  },
};
