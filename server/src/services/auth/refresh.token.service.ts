import { AccountStatus } from '@/generated/prisma/client';
import { verifyRefreshToken } from '@/lib/jwt';
import { deleteRefreshToken, findRefreshToken } from '@/repositories/token.repository';
import { findById } from '@/repositories/user.repository';
import { issueTokens } from '@/services/auth/issue.tokens.service';
import type { AuthTokenPayload, RefreshTokenData } from '@/types/auth';
import type { ServiceResponse } from '@/types/api';

export const refreshTokenService = {
  execute: async (token?: string): Promise<ServiceResponse<RefreshTokenData>> => {
    if (!token) {
      return { status: 'error', code: 401, message: 'Refresh token missing' };
    }

    let payload: AuthTokenPayload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return { status: 'error', code: 401, message: 'Invalid or expired refresh token' };
    }

    if (payload.type !== 'refresh') {
      return { status: 'error', code: 401, message: 'Invalid or expired refresh token' };
    }

    try {
      const storedToken = await findRefreshToken(token);
      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
        return { status: 'error', code: 401, message: 'Invalid or expired refresh token' };
      }

      const user = await findById(storedToken.userId);
      if (!user) {
        return { status: 'error', code: 401, message: 'Invalid or expired refresh token' };
      }
      if (user.accountStatus !== AccountStatus.ACTIVE) {
        return { status: 'error', code: 403, message: 'Your account is not active.' };
      }

      await deleteRefreshToken(token);
      const tokens = await issueTokens(user);

      return { status: 'success', code: 200, message: 'Token refreshed', data: { tokens } };
    } catch (error) {
      console.error('refreshTokenService', error);
      return { status: 'error', code: 500, message: 'Failed to refresh token' };
    }
  },
};
