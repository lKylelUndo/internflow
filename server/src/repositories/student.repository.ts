import { EligibilityStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

const USER_SELECT = { id: true, firstName: true, lastName: true, email: true, accountStatus: true } as const;
const PROGRAM_SELECT = { id: true, code: true, name: true } as const;
const STUDENT_INCLUDE = { user: { select: USER_SELECT }, program: { select: PROGRAM_SELECT } } as const;

export const findStudentsByDepartment = (departmentId: string, eligibilityStatus?: EligibilityStatus) =>
  prisma.studentProfile.findMany({
    where: { departmentId, ...(eligibilityStatus && { eligibilityStatus }) },
    include: STUDENT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const findStudentByUserId = (userId: string) =>
  prisma.studentProfile.findUnique({ where: { userId }, include: STUDENT_INCLUDE });

export const findStudentByUserIdInDepartment = (userId: string, departmentId: string) =>
  prisma.studentProfile.findFirst({
    where: { userId, departmentId },
    include: STUDENT_INCLUDE,
  });

export const updateEligibility = (
  studentProfileId: string,
  status: EligibilityStatus,
  verifierUserId: string,
) =>
  prisma.$transaction(async (tx) => {
    const student = await tx.studentProfile.update({
      where: { id: studentProfileId },
      data: {
        eligibilityStatus: status,
        eligibilityVerifiedAt: new Date(),
        eligibilityVerifiedById: verifierUserId,
      },
      include: STUDENT_INCLUDE,
    });

    await tx.auditLog.create({
      data: {
        action: status === EligibilityStatus.ELIGIBLE
          ? 'STUDENT_ELIGIBILITY_VERIFIED'
          : 'STUDENT_ELIGIBILITY_REJECTED',
        entityType: 'StudentProfile',
        entityId: studentProfileId,
        actorId: verifierUserId,
      },
    });

    return student;
  });
