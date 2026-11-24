import { findAllDepartmentsWithPrograms } from '@/repositories/academic.repository';
import type { DepartmentsData } from '@/types/academic';
import type { ServiceResponse } from '@/types/api';

export const getDepartmentsService = {
  execute: async (): Promise<ServiceResponse<DepartmentsData>> => {
    try {
      const departments = await findAllDepartmentsWithPrograms();

      return {
        status: 'success',
        code: 200,
        message: 'Departments retrieved successfully',
        data: { departments },
      };
    } catch (error) {
      console.error('getDepartmentsService', error);
      return {
        status: 'error',
        code: 500,
        message: 'Failed to retrieve departments',
      };
    }
  },
};
