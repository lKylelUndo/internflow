import type { infer as ZodInfer } from 'zod';
import type { AccountStatus, StudentProfile } from '@/generated/prisma/client';
import type { listStudentsSchema, studentIdSchema, updateEligibilitySchema } from '@/schemas/student';

export type StudentUserSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountStatus: AccountStatus;
};

export type StudentWithRelations = StudentProfile & {
  user: StudentUserSummary;
  program: { id: string; code: string; name: string };
};

export type ListStudentsQuery = ZodInfer<typeof listStudentsSchema>['query'];
export type UpdateEligibilityInput = ZodInfer<typeof updateEligibilitySchema>['body'];
export type StudentIdParams = ZodInfer<typeof studentIdSchema>['params'];
export type ListStudentsData = { students: StudentWithRelations[] };
export type StudentData = { student: StudentWithRelations };
