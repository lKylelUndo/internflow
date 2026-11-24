import { RoleType } from '@/generated/prisma/client';
import { findApplicationById } from '@/repositories/application.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { ApplicationData } from '@/types/application';
import type { ServiceResponse } from '@/types/api';

export const getApplicationService = {
  execute: async (
    userId: string,
    role: RoleType,
    applicationId: string,
  ): Promise<ServiceResponse<ApplicationData>> => {
    try {
      const application = await findApplicationById(applicationId);
      if (!application) {
        return { status: 'error', code: 404, message: 'Application not found' };
      }

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          if (application.studentProfileId !== student.id) {
            return { status: 'error', code: 404, message: 'Application not found' };
          }
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          if (application.internship.company.id !== profile.companyId) {
            return { status: 'error', code: 404, message: 'Application not found' };
          }
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          if (application.internship.company.departmentId !== dean.departmentId) {
            return { status: 'error', code: 404, message: 'Application not found' };
          }
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Application retrieved successfully',
        data: { application },
      };
    } catch (error) {
      console.error('getApplicationService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve application' };
    }
  },
};
