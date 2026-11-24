import type { User } from '@/generated/prisma/client';

/** A User row safe to return to clients (password removed). */
export type SafeUser = Omit<User, 'password'>;

/** The shape every service returns; controllers set HTTP status from `code`. */
export type ServiceResponse<T = unknown> = {
  status: 'success' | 'error';
  code: number;
  message: string;
  data?: T;
  path?: string;
  errors?: { path: string; message: string }[];
};
