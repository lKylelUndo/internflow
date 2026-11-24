import { RoleType } from '@/generated/prisma/client';
import { findReportById } from '@/repositories/report.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { ReportData } from '@/types/report';
import type { ServiceResponse } from '@/types/api';

export const getReportService = {
  execute: async (
    userId: string,
    role: RoleType,
    reportId: string,
  ): Promise<ServiceResponse<ReportData>> => {
    try {
      const report = await findReportById(reportId);
      if (!report) {
        return { status: 'error', code: 404, message: 'Report not found' };
      }

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          if (report.deployment.studentProfile.id !== student.id) {
            return { status: 'error', code: 404, message: 'Report not found' };
          }
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          if (report.deployment.supervisorId !== profile.id) {
            return { status: 'error', code: 404, message: 'Report not found' };
          }
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          if (report.deployment.departmentId !== dean.departmentId) {
            return { status: 'error', code: 404, message: 'Report not found' };
          }
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Report retrieved successfully',
        data: { report },
      };
    } catch (error) {
      console.error('getReportService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve report' };
    }
  },
};
