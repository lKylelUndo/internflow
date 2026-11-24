import type { infer as ZodInfer } from 'zod';
import type { DeanProfile, Department, User } from '@/generated/prisma/client';
import type { deanUserIdSchema, listDeansSchema } from '@/schemas/admin';

export type ListDeansQuery = ZodInfer<typeof listDeansSchema>['query'];
export type DeanUserIdParams = ZodInfer<typeof deanUserIdSchema>['params'];
export type DeanWithDepartment = User & { deanProfile: (DeanProfile & { department: Department }) | null };
export type SafeDean = Omit<DeanWithDepartment, 'password'>;
export type ListDeansData = { deans: SafeDean[] };
export type DeanData = { user: SafeDean };
