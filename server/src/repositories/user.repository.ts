import { AccountStatus, RoleType } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { CreateDeanWithProfileInput, CreateStudentWithProfileInput, CreateSupervisorWithProfileInput } from '@/types/user';

export const findByEmail = (email: string) => prisma.user.findUnique({ where: { email } });

export const findById = (id: string) => prisma.user.findUnique({ where: { id } });

export const findByIdWithProfiles = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      studentProfile: { include: { program: true, department: true } },
      deanProfile: { include: { department: true } },
      supervisorProfile: { include: { company: true } },
    },
  });

export const findProgramById = (programId: string) =>
  prisma.program.findUnique({ where: { id: programId } });

export const findStudentProfileByUserId = (userId: string) => prisma.studentProfile.findUnique({ where: { userId } });

export const createStudentWithProfile = (input: CreateStudentWithProfileInput) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        email: input.email,
        password: input.password,
        contactNumber: input.contactNumber,
        role: RoleType.STUDENT,
        accountStatus: AccountStatus.ACTIVE,
        verifiedAt: new Date(),
      },
    });

    await tx.studentProfile.create({
      data: {
        userId: user.id,
        studentNumber: input.studentNumber,
        yearLevel: input.yearLevel,
        departmentId: input.departmentId,
        programId: input.programId,
      },
    });

    return user;
  });

export const createDeanWithProfile = (input: CreateDeanWithProfileInput) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        email: input.email,
        password: input.password,
        contactNumber: input.contactNumber,
        role: RoleType.DEAN,
        accountStatus: AccountStatus.PENDING_VERIFICATION,
      },
    });

    await tx.deanProfile.create({
      data: { userId: user.id, departmentId: input.departmentId },
    });

    return user;
  });

export const findDeanProfileByUserId = (userId: string) => prisma.deanProfile.findUnique({ where: { userId }, include: { department: true } });

export const findDeans = (status?: AccountStatus) =>
  prisma.user.findMany({
    where: { role: RoleType.DEAN, ...(status && { accountStatus: status }) },
    include: { deanProfile: { include: { department: true } } },
    orderBy: { createdAt: 'desc' },
  });

export const findDeanById = (userId: string) =>
  prisma.user.findFirst({
    where: { id: userId, role: RoleType.DEAN },
    include: { deanProfile: { include: { department: true } } },
  });

export const updateDeanStatus = (userId: string, status: AccountStatus, actorId: string) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        accountStatus: status,
        ...(status === AccountStatus.ACTIVE && {
          verifiedAt: new Date(),
          verifiedById: actorId,
        }),
      },
      include: { deanProfile: { include: { department: true } } },
    });

    await tx.auditLog.create({
      data: {
        action: status === AccountStatus.ACTIVE ? 'DEAN_VERIFIED' : 'DEAN_SUSPENDED',
        entityType: 'User',
        entityId: userId,
        actorId,
      },
    });

    return user;
  });

export const createSupervisorWithProfile = (input: CreateSupervisorWithProfileInput) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        email: input.email,
        password: input.password,
        contactNumber: input.contactNumber,
        role: RoleType.COMPANY_SUPERVISOR,
        accountStatus: AccountStatus.PENDING_VERIFICATION,
      },
    });

    await tx.companySupervisor.create({
      data: { userId: user.id, companyId: input.companyId, position: input.position },
    });

    return user;
  });
