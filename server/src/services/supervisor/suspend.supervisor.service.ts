import { AccountStatus } from '@/generated/prisma/client';
import { findSupervisorByUserIdInDepartment, updateSupervisorStatus } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import { sanitizeUser } from '@/utils/sanitize-user';
import type { SupervisorData } from '@/types/supervisor';
import type { ServiceResponse } from '@/types/api';

export const suspendSupervisorService = {
  execute: async (userId: string, deanUserId: string): Promise<ServiceResponse<SupervisorData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const supervisor = await findSupervisorByUserIdInDepartment(userId, deanProfile.departmentId);
      if (!supervisor) {
        return { status: 'error', code: 404, message: 'Supervisor not found' };
      }
      if (supervisor.user.accountStatus === AccountStatus.SUSPENDED) {
        return { status: 'error', code: 409, message: 'Supervisor is already suspended' };
      }

      const updated = await updateSupervisorStatus(userId, AccountStatus.SUSPENDED, deanUserId);
      if (!updated) {
        return { status: 'error', code: 404, message: 'Supervisor not found' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Supervisor suspended successfully',
        data: { supervisor: { ...updated, user: sanitizeUser(updated.user) } },
      };
    } catch (error) {
      console.error('suspendSupervisorService', error);
      return { status: 'error', code: 500, message: 'Failed to suspend supervisor' };
    }
  },
};
