import { AccountStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const findSupervisorsByDepartment = (departmentId: string, status?: AccountStatus) =>
  prisma.companySupervisor.findMany({
    where: { company: { departmentId }, ...(status ? { user: { accountStatus: status } } : {}) },
    include: { user: true, company: true },
    orderBy: { createdAt: 'desc' },
  });

export const findSupervisorByUserIdInDepartment = (userId: string, departmentId: string) =>
  prisma.companySupervisor.findFirst({
    where: { userId, company: { departmentId } },
    include: { user: true, company: true },
  });

export const findSupervisorProfileByUserId = (userId: string) => prisma.companySupervisor.findUnique({ where: { userId }, include: { user: true, company: true } });

export const findSupervisorProfileById = (supervisorId: string) => prisma.companySupervisor.findUnique({ where: { id: supervisorId }, include: { user: true, company: true } });

export const updateSupervisorStatus = (userId: string, status: AccountStatus, actorId: string) =>
  prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        accountStatus: status,
        ...(status === AccountStatus.ACTIVE && {
          verifiedAt: new Date(),
          verifiedById: actorId,
        }),
      },
    });

    await tx.auditLog.create({
      data: {
        action: status === AccountStatus.ACTIVE ? 'SUPERVISOR_VERIFIED' : 'SUPERVISOR_SUSPENDED',
        entityType: 'User',
        entityId: userId,
        actorId,
      },
    });

    return tx.companySupervisor.findUnique({
      where: { userId },
      include: { user: true, company: true },
    });
  });
