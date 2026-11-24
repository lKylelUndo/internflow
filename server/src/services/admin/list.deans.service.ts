import { AccountStatus } from '@/generated/prisma/client';
import { findDeans } from '@/repositories/user.repository';
import { sanitizeUser } from '@/utils/sanitize-user';
import type { ListDeansData } from '@/types/admin';
import type { ServiceResponse } from '@/types/api';

export const listDeansService = {
  execute: async (status?: AccountStatus): Promise<ServiceResponse<ListDeansData>> => {
    try {
      const deans = await findDeans(status ?? AccountStatus.PENDING_VERIFICATION);

      return {
        status: 'success',
        code: 200,
        message: 'Deans retrieved successfully',
        data: { deans: deans.map((dean) => sanitizeUser(dean)) },
      };
    } catch (error) {
      console.error('listDeansService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve deans' };
    }
  },
};
