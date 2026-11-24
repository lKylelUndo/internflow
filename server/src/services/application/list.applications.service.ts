import { RoleType, type ApplicationStatus } from '@/generated/prisma/client';
import { findApplicationsByCompany, findApplicationsByDepartment, findApplicationsByStudent } from '@/repositories/application.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { ListApplicationsData } from '@/types/application';
import type { ServiceResponse } from '@/types/api';

export const listApplicationsService = {
  execute: async (
    userId: string,
    role: RoleType,
    status?: ApplicationStatus,
  ): Promise<ServiceResponse<ListApplicationsData>> => {
    try {
      let applications: ListApplicationsData['applications'];

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          applications = await findApplicationsByStudent(student.id, status);
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          applications = await findApplicationsByCompany(profile.companyId, status);
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          applications = await findApplicationsByDepartment(dean.departmentId, status);
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Applications retrieved successfully',
        data: { applications },
      };
    } catch (error) {
      console.error('listApplicationsService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve applications' };
    }
  },
};
