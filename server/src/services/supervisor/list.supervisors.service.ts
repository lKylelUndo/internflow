import { AccountStatus } from '@/generated/prisma/client';
import { findSupervisorsByDepartment } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import { sanitizeUser } from '@/utils/sanitize-user';
import type { ListSupervisorsData } from '@/types/supervisor';
import type { ServiceResponse } from '@/types/api';

export const listSupervisorsService = {
  execute: async (
    deanUserId: string,
    status?: AccountStatus,
  ): Promise<ServiceResponse<ListSupervisorsData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const supervisors = await findSupervisorsByDepartment(
        deanProfile.departmentId,
        status ?? AccountStatus.PENDING_VERIFICATION,
      );

      return {
        status: 'success',
        code: 200,
        message: 'Supervisors retrieved successfully',
        data: {
          supervisors: supervisors.map((supervisor) => ({
            ...supervisor,
            user: sanitizeUser(supervisor.user),
          })),
        },
      };
    } catch (error) {
      console.error('listSupervisorsService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve supervisors' };
    }
  },
};
