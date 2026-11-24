import { DeploymentStatus, Prisma } from '@/generated/prisma/client';
import { findDeploymentById } from '@/repositories/deployment.repository';
import { createReport } from '@/repositories/report.repository';
import { findStudentProfileByUserId } from '@/repositories/user.repository';
import type { CreateReportInput, ReportData } from '@/types/report';
import type { ServiceResponse } from '@/types/api';

const normalizeDate = (value: Date | undefined | null): Date | null => {
  if (value === undefined || value === null) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const toUtcDate = (value: Date): Date =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

export const createReportService = {
  execute: async (studentUserId: string, input: CreateReportInput): Promise<ServiceResponse<ReportData>> => {
    try {
      const student = await findStudentProfileByUserId(studentUserId);
      if (!student) {
        return { status: 'error', code: 403, message: 'Student profile not found' };
      }

      const deployment = await findDeploymentById(input.deploymentId);
      if (!deployment || deployment.studentProfileId !== student.id) {
        return { status: 'error', code: 404, message: 'Deployment not found' };
      }
      if (
        deployment.status !== DeploymentStatus.DEPLOYED &&
        deployment.status !== DeploymentStatus.IN_PROGRESS
      ) {
        return { status: 'error', code: 400, message: 'Deployment is not active' };
      }

      const rawWeekStart = normalizeDate(input.weekStart);
      const rawWeekEnd = normalizeDate(input.weekEnd);
      if (!rawWeekStart || !rawWeekEnd) {
        return { status: 'error', code: 400, message: 'Invalid week range' };
      }
      const weekStart = toUtcDate(rawWeekStart);
      const weekEnd = toUtcDate(rawWeekEnd);
      if (weekEnd < weekStart) {
        return { status: 'error', code: 400, message: 'Week end must be on or after week start' };
      }

      const report = await createReport({
        deploymentId: input.deploymentId,
        weekStart,
        weekEnd,
        activities: input.activities,
        submittedAt: new Date(),
      });

      return {
        status: 'success',
        code: 201,
        message: 'Report submitted successfully',
        data: { report },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { status: 'error', code: 409, message: 'A report already exists for this week' };
      }

      console.error('createReportService', error);
      return { status: 'error', code: 500, message: 'Failed to submit report' };
    }
  },
};
