import { findDepartmentById } from '@/repositories/academic.repository';
import { findPublicCompaniesByDepartment } from '@/repositories/company.repository';
import type { ListPublicCompaniesData } from '@/types/company';
import type { ServiceResponse } from '@/types/api';

export const listPublicCompaniesService = {
  execute: async (departmentId: string): Promise<ServiceResponse<ListPublicCompaniesData>> => {
    try {
      const department = await findDepartmentById(departmentId);
      if (!department) {
        return { status: 'error', code: 404, message: 'Department not found' };
      }

      const companies = await findPublicCompaniesByDepartment(departmentId);

      return {
        status: 'success',
        code: 200,
        message: 'Companies retrieved successfully',
        data: { companies },
      };
    } catch (error) {
      console.error('listPublicCompaniesService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve companies' };
    }
  },
};
