import { deleteRefreshToken } from '@/repositories/token.repository';
import type { ServiceResponse } from '@/types/api';

export const logoutService = {
  execute: async (token?: string): Promise<ServiceResponse> => {
    if (token) {
      try {
        await deleteRefreshToken(token);
      } catch (error) {
        // Best-effort revocation: a logout must still succeed for the client.
        console.error('logoutService', error);
      }
    }

    return { status: 'success', code: 200, message: 'Logged out successfully' };
  },
};
