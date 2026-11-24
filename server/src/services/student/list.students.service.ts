import type { EligibilityStatus } from '@/generated/prisma/client';
import { findStudentsByDepartment } from '@/repositories/student.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { ListStudentsData } from '@/types/student';
import type { ServiceResponse } from '@/types/api';

export const listStudentsService = {
  execute: async (
    deanUserId: string,
    eligibilityStatus?: EligibilityStatus,
  ): Promise<ServiceResponse<ListStudentsData>> => {
    try {
      const dean = await findDeanProfileByUserId(deanUserId);
      if (!dean) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const students = await findStudentsByDepartment(dean.departmentId, eligibilityStatus);

      return {
        status: 'success',
        code: 200,
        message: 'Students retrieved successfully',
        data: { students },
      };
    } catch (error) {
      console.error('listStudentsService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve students' };
    }
  },
};
