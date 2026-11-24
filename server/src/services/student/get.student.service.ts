import { findStudentByUserIdInDepartment } from '@/repositories/student.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { StudentData } from '@/types/student';
import type { ServiceResponse } from '@/types/api';

export const getStudentService = {
  execute: async (deanUserId: string, userId: string): Promise<ServiceResponse<StudentData>> => {
    try {
      const dean = await findDeanProfileByUserId(deanUserId);
      if (!dean) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const student = await findStudentByUserIdInDepartment(userId, dean.departmentId);
      if (!student) {
        return { status: 'error', code: 404, message: 'Student not found' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Student retrieved successfully',
        data: { student },
      };
    } catch (error) {
      console.error('getStudentService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve student' };
    }
  },
};
