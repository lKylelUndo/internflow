import { DeploymentStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { CreateDeploymentRecord } from '@/types/deployment';

const STUDENT_SELECT = {
  id: true,
  studentNumber: true,
  yearLevel: true,
  departmentId: true,
  programId: true,
  user: { select: { firstName: true, lastName: true, email: true } },
} as const;
const DEPLOYMENT_INCLUDE = {
  studentProfile: { select: STUDENT_SELECT },
  company: { select: { id: true, name: true } },
  internship: { select: { id: true, title: true } },
  supervisor: { select: { id: true, position: true, user: { select: { firstName: true, lastName: true, email: true } } } },
} as const;

export const findDeploymentById = (deploymentId: string) =>
  prisma.deployment.findUnique({ where: { id: deploymentId }, include: DEPLOYMENT_INCLUDE });

export const findDeploymentByApplicationId = (applicationId: string) =>
  prisma.deployment.findUnique({ where: { applicationId }, include: DEPLOYMENT_INCLUDE });

export const findActiveDeploymentByStudent = (studentProfileId: string) =>
  prisma.deployment.findFirst({
    where: {
      studentProfileId,
      status: {
        in: [DeploymentStatus.PENDING_ACCEPTANCE, DeploymentStatus.DEPLOYED, DeploymentStatus.IN_PROGRESS],
      },
    },
    include: DEPLOYMENT_INCLUDE,
  });

export const findDeploymentsByStudent = (studentProfileId: string, status?: DeploymentStatus) =>
  prisma.deployment.findMany({
    where: { studentProfileId, ...(status && { status }) },
    include: DEPLOYMENT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const findDeploymentsBySupervisor = (supervisorId: string, status?: DeploymentStatus) =>
  prisma.deployment.findMany({
    where: { supervisorId, ...(status && { status }) },
    include: DEPLOYMENT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const findDeploymentsByDepartment = (departmentId: string, status?: DeploymentStatus) =>
  prisma.deployment.findMany({
    where: { departmentId, ...(status && { status }) },
    include: DEPLOYMENT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const createDeployment = (record: CreateDeploymentRecord) =>
  prisma.deployment.create({ data: record, include: DEPLOYMENT_INCLUDE });

export const acceptDeployment = (deploymentId: string) =>
  prisma.deployment.update({
    where: { id: deploymentId },
    data: { status: DeploymentStatus.DEPLOYED, acceptedAt: new Date() },
    include: DEPLOYMENT_INCLUDE,
  });

export const completeDeployment = (deploymentId: string) =>
  prisma.deployment.update({
    where: { id: deploymentId },
    data: { status: DeploymentStatus.COMPLETED, completedAt: new Date() },
    include: DEPLOYMENT_INCLUDE,
  });

export const cancelDeployment = (deploymentId: string, reason: string) =>
  prisma.deployment.update({
    where: { id: deploymentId },
    data: { status: DeploymentStatus.CANCELLED, cancelledReason: reason },
    include: DEPLOYMENT_INCLUDE,
  });
