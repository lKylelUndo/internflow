import { prisma } from '@/lib/prisma';
import type { CreateOjtRequirementRecord, UpdateOjtRequirementRecord } from '@/types/ojt-requirement';

export const findRequirementsByDepartment = (departmentId: string) =>
  prisma.oJTRequirement.findMany({
    where: { departmentId },
    include: { program: true },
    orderBy: { createdAt: 'desc' },
  });

export const findRequirementById = (requirementId: string) =>
  prisma.oJTRequirement.findUnique({
    where: { id: requirementId },
    include: { program: true },
  });

export const findRequirementByDepartmentAndProgram = (departmentId: string, programId: string | null) =>
  prisma.oJTRequirement.findFirst({
    where: { departmentId, programId },
    include: { program: true },
  });

export const createRequirement = (data: CreateOjtRequirementRecord) =>
  prisma.oJTRequirement.create({ data, include: { program: true } });

export const updateRequirement = (requirementId: string, data: UpdateOjtRequirementRecord) =>
  prisma.oJTRequirement.update({ where: { id: requirementId }, data, include: { program: true } });
