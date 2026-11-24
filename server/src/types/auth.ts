import type { infer as ZodInfer } from 'zod';
import type { RoleType } from '@/generated/prisma/client';
import type { deanSignupSchema, loginSchema, studentSignupSchema, supervisorSignupSchema } from '@/schemas/auth';
import type { SafeUser } from '@/types/api';

export type AuthTokenPayload = { userId: string; email: string; role: RoleType; type: 'access' | 'refresh' };
export type AuthTokens = { accessToken: string; refreshToken: string };
export type StudentSignupInput = ZodInfer<typeof studentSignupSchema>['body'];
export type DeanSignupInput = ZodInfer<typeof deanSignupSchema>['body'];
export type LoginInput = ZodInfer<typeof loginSchema>['body'];
export type SupervisorSignupInput = ZodInfer<typeof supervisorSignupSchema>['body'];
export type StudentSignupData = { user: SafeUser; tokens: AuthTokens };
export type DeanSignupData = { user: SafeUser };
export type SupervisorSignupData = { user: SafeUser };
export type LoginData = { user: SafeUser; tokens: AuthTokens };
export type RefreshTokenData = { tokens: AuthTokens };
export type MeData = { user: SafeUser };
export type CreateRefreshTokenInput = { userId: string; token: string; expiresAt: Date };
