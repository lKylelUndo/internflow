import { ReportStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { CreateReportRecord, ReportFilters, UpdateReportRecord } from '@/types/report';

const STUDENT_SELECT = {
  id: true,
  studentNumber: true,
  user: { select: { firstName: true, lastName: true } },
} as const;
const REPORT_INCLUDE = {
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

export const findReportById = (reportId: string) =>
  prisma.accomplishmentReport.findUnique({ where: { id: reportId }, include: REPORT_INCLUDE });

export const findReportByDeploymentAndWeek = (deploymentId: string, weekStart: Date) =>
  prisma.accomplishmentReport.findUnique({
    where: { deploymentId_weekStart: { deploymentId, weekStart } },
    include: REPORT_INCLUDE,
  });

export const findReportsByStudent = (studentProfileId: string, filters: ReportFilters) =>
  prisma.accomplishmentReport.findMany({
    where: {
      deployment: { studentProfileId },
      ...(filters.deploymentId && { deploymentId: filters.deploymentId }),
      ...(filters.status && { status: filters.status }),
    },
    include: REPORT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const findReportsBySupervisor = (supervisorId: string, filters: ReportFilters) =>
  prisma.accomplishmentReport.findMany({
    where: {
      deployment: { supervisorId },
      ...(filters.deploymentId && { deploymentId: filters.deploymentId }),
      ...(filters.status && { status: filters.status }),
    },
    include: REPORT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const findReportsByDepartment = (departmentId: string, filters: ReportFilters) =>
  prisma.accomplishmentReport.findMany({
    where: {
      deployment: { departmentId },
      ...(filters.deploymentId && { deploymentId: filters.deploymentId }),
      ...(filters.status && { status: filters.status }),
    },
    include: REPORT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

export const createReport = (record: CreateReportRecord) =>
  prisma.accomplishmentReport.create({ data: record, include: REPORT_INCLUDE });

export const updateReport = (reportId: string, record: UpdateReportRecord) =>
  prisma.accomplishmentReport.update({
    where: { id: reportId },
    data: record,
    include: REPORT_INCLUDE,
  });

export const reviewReport = (
  reportId: string,
  status: ReportStatus,
  feedback: string | null,
  reviewerProfileId: string,
) =>
  prisma.accomplishmentReport.update({
    where: { id: reportId },
    data: {
      status,
      feedback: status === ReportStatus.REVISION_REQUESTED ? (feedback ?? null) : null,
      reviewedById: reviewerProfileId,
      reviewedAt: new Date(),
    },
    include: REPORT_INCLUDE,
  });
