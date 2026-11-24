import { AccountStatus } from '@/generated/prisma/client';
import { findDeanById, updateDeanStatus } from '@/repositories/user.repository';
import { sanitizeUser } from '@/utils/sanitize-user';
import type { DeanData } from '@/types/admin';
import type { ServiceResponse } from '@/types/api';

export const verifyDeanService = {
  execute: async (userId: string, adminId: string): Promise<ServiceResponse<DeanData>> => {
    try {
      const dean = await findDeanById(userId);
      if (!dean) {
        return { status: 'error', code: 404, message: 'Dean not found' };
      }
      if (dean.accountStatus !== AccountStatus.PENDING_VERIFICATION) {
        return { status: 'error', code: 409, message: 'Only pending deans can be verified' };
      }

      const user = await updateDeanStatus(userId, AccountStatus.ACTIVE, adminId);

      return {
        status: 'success',
        code: 200,
        message: 'Dean verified successfully',
        data: { user: sanitizeUser(user) },
      };
    } catch (error) {
      console.error('verifyDeanService', error);
      return { status: 'error', code: 500, message: 'Failed to verify dean' };
    }
  },
};
