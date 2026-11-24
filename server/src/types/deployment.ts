import type { infer as ZodInfer } from 'zod';
import type { Deployment } from '@/generated/prisma/client';
import type { cancelDeploymentSchema, createDeploymentSchema, deploymentIdSchema, listDeploymentsSchema } from '@/schemas/deployment';

export type StudentSummary = {
  id: string;
  studentNumber: string;
  yearLevel: number;
  departmentId: string;
  programId: string;
  user: { firstName: string; lastName: string; email: string };
};

export type DeploymentWithRelations = Deployment & {
  studentProfile: StudentSummary;
  company: { id: string; name: string };
  internship: { id: string; title: string };
  supervisor: { id: string; position: string | null; user: { firstName: string; lastName: string; email: string } };
};

export type CreateDeploymentInput = ZodInfer<typeof createDeploymentSchema>['body'];
export type CancelDeploymentInput = ZodInfer<typeof cancelDeploymentSchema>['body'];
export type DeploymentIdParams = ZodInfer<typeof deploymentIdSchema>['params'];
export type ListDeploymentsQuery = ZodInfer<typeof listDeploymentsSchema>['query'];
export type CreateDeploymentRecord = {
  applicationId: string;
  studentProfileId: string;
  companyId: string;
  internshipId: string;
  supervisorId: string;
  departmentId: string;
  deployedById: string;
  startDate: Date;
  endDate?: Date;
  requiredHours: number;
};
export type DeploymentData = { deployment: DeploymentWithRelations };
export type ListDeploymentsData = { deployments: DeploymentWithRelations[] };
