import type { infer as ZodInfer } from 'zod';
import type { AccomplishmentReport, DeploymentStatus, ReportStatus } from '@/generated/prisma/client';
import type { createReportSchema, listReportsSchema, reportIdSchema, reviewReportSchema, updateReportSchema } from '@/schemas/report';

export type ReportStudentSummary = {
  id: string;
  studentNumber: string;
  user: { firstName: string; lastName: string };
};

export type ReportDeployment = {
  id: string;
  status: DeploymentStatus;
  supervisorId: string;
  departmentId: string;
  studentProfile: ReportStudentSummary;
  company: { id: string; name: string };
  internship: { id: string; title: string };
};

export type ReportWithRelations = AccomplishmentReport & { deployment: ReportDeployment };

export type CreateReportInput = ZodInfer<typeof createReportSchema>['body'];
export type UpdateReportInput = ZodInfer<typeof updateReportSchema>['body'];
export type ReviewReportInput = ZodInfer<typeof reviewReportSchema>['body'];
export type ReportIdParams = ZodInfer<typeof reportIdSchema>['params'];
export type ListReportsQuery = ZodInfer<typeof listReportsSchema>['query'];
export type ReportFilters = { deploymentId?: string; status?: ReportStatus };

export type CreateReportRecord = {
  deploymentId: string;
  weekStart: Date;
  weekEnd: Date;
  activities: string;
  submittedAt: Date;
};

export type UpdateReportRecord = {
  weekStart?: Date;
  weekEnd?: Date;
  activities?: string;
  status?: ReportStatus;
  submittedAt?: Date;
  feedback?: null;
  reviewedById?: null;
  reviewedAt?: null;
};

export type ReportData = { report: ReportWithRelations };
export type ListReportsData = { reports: ReportWithRelations[] };
