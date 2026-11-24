import { RoleType } from '@/generated/prisma/client';
import { findAttendanceById } from '@/repositories/attendance.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { AttendanceData } from '@/types/attendance';
import type { ServiceResponse } from '@/types/api';

export const getAttendanceService = {
  execute: async (
    userId: string,
    role: RoleType,
    attendanceId: string,
  ): Promise<ServiceResponse<AttendanceData>> => {
    try {
      const attendance = await findAttendanceById(attendanceId);
      if (!attendance) {
        return { status: 'error', code: 404, message: 'Attendance not found' };
      }

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          if (attendance.deployment.studentProfile.id !== student.id) {
            return { status: 'error', code: 404, message: 'Attendance not found' };
          }
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          if (attendance.deployment.supervisorId !== profile.id) {
            return { status: 'error', code: 404, message: 'Attendance not found' };
          }
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          if (attendance.deployment.departmentId !== dean.departmentId) {
            return { status: 'error', code: 404, message: 'Attendance not found' };
          }
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Attendance retrieved successfully',
        data: { attendance },
      };
    } catch (error) {
      console.error('getAttendanceService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve attendance' };
    }
  },
};
