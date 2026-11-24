import { findByIdWithProfiles } from '@/repositories/user.repository';
import { sanitizeUser } from '@/utils/sanitize-user';
import type { ServiceResponse } from '@/types/api';
import type { MeData } from '@/types/auth';

export const getMeService = {
  execute: async (userId: string): Promise<ServiceResponse<MeData>> => {
    try {
      const user = await findByIdWithProfiles(userId);
      if (!user) {
        return { status: 'error', code: 404, message: 'User not found' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'User retrieved successfully',
        data: { user: sanitizeUser(user) },
      };
    } catch (error) {
      console.error('getMeService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve user' };
    }
  },
};
