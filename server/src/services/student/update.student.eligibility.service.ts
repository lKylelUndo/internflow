import { EligibilityStatus } from '@/generated/prisma/client';
import { findStudentByUserIdInDepartment, updateEligibility } from '@/repositories/student.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { StudentData, UpdateEligibilityInput } from '@/types/student';
import type { ServiceResponse } from '@/types/api';

export const updateStudentEligibilityService = {
  execute: async (
    deanUserId: string,
    userId: string,
    input: UpdateEligibilityInput,
  ): Promise<ServiceResponse<StudentData>> => {
    try {
      const dean = await findDeanProfileByUserId(deanUserId);
      if (!dean) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const existing = await findStudentByUserIdInDepartment(userId, dean.departmentId);
      if (!existing) {
        return { status: 'error', code: 404, message: 'Student not found' };
      }

      const status = input.eligibilityStatus as EligibilityStatus;
      const student = await updateEligibility(existing.id, status, deanUserId);

      return {
        status: 'success',
        code: 200,
        message: status === EligibilityStatus.ELIGIBLE
          ? 'Student marked as eligible'
          : 'Student marked as ineligible',
        data: { student },
      };
    } catch (error) {
      console.error('updateStudentEligibilityService', error);
      return { status: 'error', code: 500, message: 'Failed to update student eligibility' };
    }
  },
};
