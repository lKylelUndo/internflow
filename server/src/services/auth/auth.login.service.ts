import { AccountStatus } from '@/generated/prisma/client';
import { comparePassword } from '@/lib/bcrypt';
import { findByEmail } from '@/repositories/user.repository';
import { issueTokens } from '@/services/auth/issue.tokens.service';
import { sanitizeUser } from '@/utils/sanitize-user';
import type { LoginData, LoginInput } from '@/types/auth';
import type { ServiceResponse } from '@/types/api';

export const authLoginService = {
  execute: async (input: LoginInput): Promise<ServiceResponse<LoginData>> => {
    const email = input.email.trim().toLowerCase();

    try {
      const user = await findByEmail(email);
      if (!user || !(await comparePassword(input.password, user.password))) {
        return { status: 'error', code: 401, message: 'Invalid email or password' };
      }

      if (user.accountStatus === AccountStatus.PENDING_VERIFICATION) {
        return { status: 'error', code: 403, message: 'Your account is pending verification.' };
      }
      if (user.accountStatus === AccountStatus.SUSPENDED) {
        return { status: 'error', code: 403, message: 'Your account has been suspended.' };
      }

      const tokens = await issueTokens(user);
      return {
        status: 'success',
        code: 200,
        message: 'Login successful',
        data: { user: sanitizeUser(user), tokens },
      };
    } catch (error) {
      console.error('authLoginService', error);
      return { status: 'error', code: 500, message: 'Failed to log in' };
    }
  },
};
