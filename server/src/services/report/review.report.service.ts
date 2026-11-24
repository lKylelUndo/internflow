import { ReportStatus } from '@/generated/prisma/client';
import { findReportById, reviewReport } from '@/repositories/report.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import type { ReportData, ReviewReportInput } from '@/types/report';
import type { ServiceResponse } from '@/types/api';

export const reviewReportService = {
  execute: async (
    supervisorUserId: string,
    reportId: string,
    input: ReviewReportInput,
  ): Promise<ServiceResponse<ReportData>> => {
    try {
      const profile = await findSupervisorProfileByUserId(supervisorUserId);
      if (!profile) {
        return { status: 'error', code: 403, message: 'Supervisor profile not found' };
      }

      const report = await findReportById(reportId);
      if (!report || report.deployment.supervisorId !== profile.id) {
        return { status: 'error', code: 404, message: 'Report not found' };
      }
      if (report.status !== ReportStatus.PENDING) {
        return { status: 'error', code: 409, message: 'Only pending reports can be reviewed' };
      }

      const status = input.status as ReportStatus;
      const feedback = status === ReportStatus.REVISION_REQUESTED ? (input.feedback ?? null) : null;
      const updated = await reviewReport(reportId, status, feedback, profile.id);

      return {
        status: 'success',
        code: 200,
        message: 'Report reviewed successfully',
        data: { report: updated },
      };
    } catch (error) {
      console.error('reviewReportService', error);
      return { status: 'error', code: 500, message: 'Failed to review report' };
    }
  },
};
