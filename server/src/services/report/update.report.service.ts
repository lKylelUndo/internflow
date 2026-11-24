import { ReportStatus } from '@/generated/prisma/client';
import { findReportById, updateReport } from '@/repositories/report.repository';
import { findStudentProfileByUserId } from '@/repositories/user.repository';
import type { ReportData, UpdateReportInput, UpdateReportRecord } from '@/types/report';
import type { ServiceResponse } from '@/types/api';

const normalizeDate = (value: Date | undefined | null): Date | null => {
  if (value === undefined || value === null) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const toUtcDate = (value: Date): Date =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

export const updateReportService = {
  execute: async (
    studentUserId: string,
    reportId: string,
    input: UpdateReportInput,
  ): Promise<ServiceResponse<ReportData>> => {
    try {
      const student = await findStudentProfileByUserId(studentUserId);
      if (!student) {
        return { status: 'error', code: 403, message: 'Student profile not found' };
      }

      const report = await findReportById(reportId);
      if (!report || report.deployment.studentProfile.id !== student.id) {
        return { status: 'error', code: 404, message: 'Report not found' };
      }
      if (
        report.status !== ReportStatus.PENDING &&
        report.status !== ReportStatus.REVISION_REQUESTED
      ) {
        return { status: 'error', code: 409, message: 'Only pending or revision-requested reports can be edited' };
      }

      let weekStart = report.weekStart;
      let weekEnd = report.weekEnd;
      if (input.weekStart !== undefined) {
        const normalized = normalizeDate(input.weekStart);
        if (!normalized) {
          return { status: 'error', code: 400, message: 'Invalid week range' };
        }
        weekStart = toUtcDate(normalized);
      }
      if (input.weekEnd !== undefined) {
        const normalized = normalizeDate(input.weekEnd);
        if (!normalized) {
          return { status: 'error', code: 400, message: 'Invalid week range' };
        }
        weekEnd = toUtcDate(normalized);
      }
      if (weekEnd < weekStart) {
        return { status: 'error', code: 400, message: 'Week end must be on or after week start' };
      }

      const record: UpdateReportRecord = {
        status: ReportStatus.PENDING,
        submittedAt: new Date(),
        feedback: null,
        reviewedById: null,
        reviewedAt: null,
        ...(input.weekStart !== undefined && { weekStart }),
        ...(input.weekEnd !== undefined && { weekEnd }),
        ...(input.activities !== undefined && { activities: input.activities }),
      };

      const updated = await updateReport(reportId, record);

      return {
        status: 'success',
        code: 200,
        message: 'Report updated successfully',
        data: { report: updated },
      };
    } catch (error) {
      console.error('updateReportService', error);
      return { status: 'error', code: 500, message: 'Failed to update report' };
    }
  },
};
