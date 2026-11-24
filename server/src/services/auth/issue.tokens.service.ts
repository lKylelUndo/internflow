import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { createRefreshToken } from '@/repositories/token.repository';
import type { RoleType } from '@/generated/prisma/client';
import type { AuthTokens } from '@/types/auth';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const issueTokens = async (user: {
  id: string;
  email: string;
  role: RoleType;
}): Promise<AuthTokens> => {
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await createRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken };
};
