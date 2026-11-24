import type { infer as ZodInfer } from 'zod';
import type { DeploymentStatus, Evaluation, EvaluationStatus } from '@/generated/prisma/client';
import type { createEvaluationSchema, evaluationIdSchema, listEvaluationsSchema, updateEvaluationSchema } from '@/schemas/evaluation';

export type EvaluationStudentSummary = {
  id: string;
  studentNumber: string;
  user: { firstName: string; lastName: string };
};

export type EvaluationDeployment = {
  id: string;
  status: DeploymentStatus;
  supervisorId: string;
  departmentId: string;
  studentProfile: EvaluationStudentSummary;
  company: { id: string; name: string };
  internship: { id: string; title: string };
};

export type EvaluationWithRelations = Evaluation & { deployment: EvaluationDeployment };

export type CreateEvaluationInput = ZodInfer<typeof createEvaluationSchema>['body'];
export type UpdateEvaluationInput = ZodInfer<typeof updateEvaluationSchema>['body'];
export type EvaluationIdParams = ZodInfer<typeof evaluationIdSchema>['params'];
export type ListEvaluationsQuery = ZodInfer<typeof listEvaluationsSchema>['query'];
export type EvaluationFilters = { deploymentId?: string; status?: EvaluationStatus };

export type CreateEvaluationRecord = {
  deploymentId: string;
  supervisorId: string;
  status: EvaluationStatus;
  workPerformance: number;
  communication: number;
  professionalism: number;
  teamwork: number;
  punctuality: number;
  overallRating: number;
  strengths?: string;
  improvements?: string;
  comments?: string;
  submittedAt: Date;
};

export type UpdateEvaluationRecord = {
  workPerformance?: number;
  communication?: number;
  professionalism?: number;
  teamwork?: number;
  punctuality?: number;
  overallRating?: number;
  strengths?: string;
  improvements?: string;
  comments?: string;
};

export type EvaluationData = { evaluation: EvaluationWithRelations };
export type ListEvaluationsData = { evaluations: EvaluationWithRelations[] };
