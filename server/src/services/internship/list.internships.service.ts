import { findInternshipsByCompany, findInternshipsByDepartment, findOpenInternshipsByDepartment } from '@/repositories/internship.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import { RoleType } from '@/generated/prisma/client';
import type { ListInternshipsData } from '@/types/internship';
import type { ServiceResponse } from '@/types/api';

export const listInternshipsService = {
  execute: async (
    userId: string,
    role: RoleType,
    isOpen?: boolean,
  ): Promise<ServiceResponse<ListInternshipsData>> => {
    try {
      let internships: ListInternshipsData['internships'];

      switch (role) {
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          internships = await findInternshipsByCompany(profile.companyId, isOpen);
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          internships = await findInternshipsByDepartment(dean.departmentId, isOpen);
          break;
        }
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          internships = await findOpenInternshipsByDepartment(student.departmentId);
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Internships retrieved successfully',
        data: { internships },
      };
    } catch (error) {
      console.error('listInternshipsService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve internships' };
    }
  },
};
