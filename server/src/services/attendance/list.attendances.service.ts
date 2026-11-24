import { RoleType } from '@/generated/prisma/client';
import { findAttendancesByDepartment, findAttendancesByStudent, findAttendancesBySupervisor } from '@/repositories/attendance.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { AttendanceFilters, ListAttendancesData } from '@/types/attendance';
import type { ServiceResponse } from '@/types/api';

export const listAttendancesService = {
  execute: async (
    userId: string,
    role: RoleType,
    filters: AttendanceFilters,
  ): Promise<ServiceResponse<ListAttendancesData>> => {
    try {
      let attendances: ListAttendancesData['attendances'];

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          attendances = await findAttendancesByStudent(student.id, filters);
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          attendances = await findAttendancesBySupervisor(profile.id, filters);
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          attendances = await findAttendancesByDepartment(dean.departmentId, filters);
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Attendances retrieved successfully',
        data: { attendances },
      };
    } catch (error) {
      console.error('listAttendancesService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve attendances' };
    }
  },
};
