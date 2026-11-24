import type { infer as ZodInfer } from 'zod';
import type { InternshipApplication } from '@/generated/prisma/client';
import type { applicationIdSchema, createApplicationSchema, listApplicationsSchema, reviewApplicationSchema } from '@/schemas/application';

export type StudentSummary = {
  id: string;
  studentNumber: string;
  yearLevel: number;
  departmentId: string;
  programId: string;
  user: { firstName: string; lastName: string; email: string };
};

export type ApplicationWithRelations = InternshipApplication & {
  internship: { id: string; title: string; company: { id: string; name: string; departmentId: string } };
  studentProfile: StudentSummary;
};

export type CreateApplicationInput = ZodInfer<typeof createApplicationSchema>['body'];
export type ReviewApplicationInput = ZodInfer<typeof reviewApplicationSchema>['body'];
export type ApplicationIdParams = ZodInfer<typeof applicationIdSchema>['params'];
export type ListApplicationsQuery = ZodInfer<typeof listApplicationsSchema>['query'];
export type CreateApplicationRecord = { studentProfileId: string; internshipId: string; coverLetter?: string };
export type ApplicationData = { application: ApplicationWithRelations };
export type ListApplicationsData = { applications: ApplicationWithRelations[] };
