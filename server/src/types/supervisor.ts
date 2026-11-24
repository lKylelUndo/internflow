import type { infer as ZodInfer } from 'zod';
import type { Company, CompanySupervisor, User } from '@/generated/prisma/client';
import type { listSupervisorsSchema, supervisorUserIdSchema } from '@/schemas/supervisor';
import type { SafeUser } from '@/types/api';

export type ListSupervisorsQuery = ZodInfer<typeof listSupervisorsSchema>['query'];
export type SupervisorUserIdParams = ZodInfer<typeof supervisorUserIdSchema>['params'];
export type SupervisorWithUserAndCompany = CompanySupervisor & { user: User; company: Company };
export type SafeSupervisor = Omit<SupervisorWithUserAndCompany, 'user'> & { user: SafeUser };
export type ListSupervisorsData = { supervisors: SafeSupervisor[] };
export type SupervisorData = { supervisor: SafeSupervisor };
