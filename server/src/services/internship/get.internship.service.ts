import { RoleType } from '@/generated/prisma/client';
import { findInternshipById } from '@/repositories/internship.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { InternshipData } from '@/types/internship';
import type { ServiceResponse } from '@/types/api';

export const getInternshipService = {
  execute: async (
    userId: string,
    role: RoleType,
    internshipId: string,
  ): Promise<ServiceResponse<InternshipData>> => {
    try {
      const internship = await findInternshipById(internshipId);
      if (!internship) {
        return { status: 'error', code: 404, message: 'Internship not found' };
      }

      switch (role) {
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          if (internship.companyId !== profile.companyId) {
            return { status: 'error', code: 404, message: 'Internship not found' };
          }
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          if (internship.company.departmentId !== dean.departmentId) {
            return { status: 'error', code: 404, message: 'Internship not found' };
          }
          break;
        }
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          const visible =
            internship.company.departmentId === student.departmentId &&
            internship.company.isActive &&
            internship.isOpen &&
            (internship.deadline === null || internship.deadline >= new Date());
          if (!visible) {
            return { status: 'error', code: 404, message: 'Internship not found' };
          }
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Internship retrieved successfully',
        data: { internship },
      };
    } catch (error) {
      console.error('getInternshipService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve internship' };
    }
  },
};
