import { RoleType } from '@/generated/prisma/client';
import { findReportsByDepartment, findReportsByStudent, findReportsBySupervisor } from '@/repositories/report.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { ListReportsData, ReportFilters } from '@/types/report';
import type { ServiceResponse } from '@/types/api';

export const listReportsService = {
  execute: async (
    userId: string,
    role: RoleType,
    filters: ReportFilters,
  ): Promise<ServiceResponse<ListReportsData>> => {
    try {
      let reports: ListReportsData['reports'];

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          reports = await findReportsByStudent(student.id, filters);
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          reports = await findReportsBySupervisor(profile.id, filters);
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          reports = await findReportsByDepartment(dean.departmentId, filters);
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Reports retrieved successfully',
        data: { reports },
      };
    } catch (error) {
      console.error('listReportsService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve reports' };
    }
  },
};
