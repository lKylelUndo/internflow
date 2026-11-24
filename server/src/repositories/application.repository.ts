import { ApplicationStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { CreateApplicationRecord } from '@/types/application';

const COMPANY_SELECT = { id: true, name: true, departmentId: true } as const;
const STUDENT_SELECT = {
  id: true,
  studentNumber: true,
  yearLevel: true,
  departmentId: true,
  programId: true,
  user: { select: { firstName: true, lastName: true, email: true } },
} as const;
const APPLICATION_INCLUDE = {
  internship: { select: { id: true, title: true, company: { select: COMPANY_SELECT } } },
  studentProfile: { select: STUDENT_SELECT },
} as const;

export const findApplicationByStudentAndInternship = (studentProfileId: string, internshipId: string) =>
  prisma.internshipApplication.findUnique({
    where: { studentProfileId_internshipId: { studentProfileId, internshipId } },
  });

export const findApplicationById = (applicationId: string) =>
  prisma.internshipApplication.findUnique({
    where: { id: applicationId },
    include: APPLICATION_INCLUDE,
  });

export const findApplicationsByStudent = (studentProfileId: string, status?: ApplicationStatus) =>
  prisma.internshipApplication.findMany({
    where: { studentProfileId, ...(status && { status }) },
    include: APPLICATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const findApplicationsByCompany = (companyId: string, status?: ApplicationStatus) =>
  prisma.internshipApplication.findMany({
    where: { internship: { companyId }, ...(status && { status }) },
    include: APPLICATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const findApplicationsByDepartment = (departmentId: string, status?: ApplicationStatus) =>
  prisma.internshipApplication.findMany({
    where: { internship: { company: { departmentId } }, ...(status && { status }) },
    include: APPLICATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const createApplication = (record: CreateApplicationRecord) =>
  prisma.internshipApplication.create({ data: record, include: APPLICATION_INCLUDE });

export const resetWithdrawnApplication = (applicationId: string, coverLetter?: string) =>
  prisma.internshipApplication.update({
    where: { id: applicationId },
    data: {
      status: ApplicationStatus.PENDING,
      coverLetter: coverLetter ?? null,
      rejectionReason: null,
      reviewedById: null,
      reviewedAt: null,
    },
    include: APPLICATION_INCLUDE,
  });

export const reviewApplication = (
  applicationId: string,
  status: ApplicationStatus,
  rejectionReason: string | null,
  reviewerUserId: string,
) =>
  prisma.internshipApplication.update({
    where: { id: applicationId },
    data: {
      status,
      rejectionReason,
      reviewedById: reviewerUserId,
      reviewedAt: new Date(),
    },
    include: APPLICATION_INCLUDE,
  });

export const withdrawApplication = (applicationId: string) =>
  prisma.internshipApplication.update({
    where: { id: applicationId },
    data: { status: ApplicationStatus.WITHDRAWN },
    include: APPLICATION_INCLUDE,
  });
