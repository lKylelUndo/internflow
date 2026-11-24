import type { RoleType } from '@/generated/prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: RoleType;
      type: 'access';
    };
  }
}

export {};
