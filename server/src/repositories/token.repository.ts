import { TokenType } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { CreateRefreshTokenInput } from '@/types/auth';

export const createRefreshToken = (input: CreateRefreshTokenInput) =>
  prisma.token.create({
    data: {
      type: TokenType.REFRESH,
      userId: input.userId,
      token: input.token,
      expiresAt: input.expiresAt,
    },
  });

export const findRefreshToken = (token: string) => prisma.token.findUnique({ where: { token } });

export const deleteRefreshToken = (token: string) => prisma.token.deleteMany({ where: { token } });
