import { EvaluationStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { CreateEvaluationRecord, EvaluationFilters, UpdateEvaluationRecord } from '@/types/evaluation';

const STUDENT_SELECT = {
  id: true,
  studentNumber: true,
  user: { select: { firstName: true, lastName: true } },
} as const;
const EVALUATION_INCLUDE = {
  deployment: {
    select: {
      id: true,
      status: true,
      supervisorId: true,
      departmentId: true,
      studentProfile: { select: STUDENT_SELECT },
      company: { select: { id: true, name: true } },
      internship: { select: { id: true, title: true } },
    },
  },
} as const;

export const findEvaluationById = (evaluationId: string) =>
  prisma.evaluation.findUnique({ where: { id: evaluationId }, include: EVALUATION_INCLUDE });

export const findEvaluationByDeploymentId = (deploymentId: string) =>
  prisma.evaluation.findFirst({ where: { deploymentId }, include: EVALUATION_INCLUDE });

export const findEvaluationsByStudent = (studentProfileId: string, filters: EvaluationFilters) =>
  prisma.evaluation.findMany({
    where: {
      deployment: { studentProfileId },
      ...(filters.deploymentId && { deploymentId: filters.deploymentId }),
      ...(filters.status && { status: filters.status }),
    },
    include: EVALUATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const findEvaluationsBySupervisor = (supervisorId: string, filters: EvaluationFilters) =>
  prisma.evaluation.findMany({
    where: {
      deployment: { supervisorId },
      ...(filters.deploymentId && { deploymentId: filters.deploymentId }),
      ...(filters.status && { status: filters.status }),
    },
    include: EVALUATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const findEvaluationsByDepartment = (departmentId: string, filters: EvaluationFilters) =>
  prisma.evaluation.findMany({
    where: {
      deployment: { departmentId },
      ...(filters.deploymentId && { deploymentId: filters.deploymentId }),
      ...(filters.status && { status: filters.status }),
    },
    include: EVALUATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const createEvaluation = (record: CreateEvaluationRecord) =>
  prisma.evaluation.create({ data: record, include: EVALUATION_INCLUDE });

export const updateEvaluation = (evaluationId: string, record: UpdateEvaluationRecord) =>
  prisma.evaluation.update({
    where: { id: evaluationId },
    data: record,
    include: EVALUATION_INCLUDE,
  });

export const reviewEvaluation = (evaluationId: string, reviewerUserId: string) =>
  prisma.evaluation.update({
    where: { id: evaluationId },
    data: { status: EvaluationStatus.REVIEWED, reviewedById: reviewerUserId, reviewedAt: new Date() },
    include: EVALUATION_INCLUDE,
  });
