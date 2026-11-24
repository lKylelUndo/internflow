import { findAttendanceById, verifyAttendance } from '@/repositories/attendance.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import type { AttendanceData } from '@/types/attendance';
import type { ServiceResponse } from '@/types/api';

export const verifyAttendanceService = {
  execute: async (supervisorUserId: string, attendanceId: string): Promise<ServiceResponse<AttendanceData>> => {
    try {
      const profile = await findSupervisorProfileByUserId(supervisorUserId);
      if (!profile) {
        return { status: 'error', code: 403, message: 'Supervisor profile not found' };
      }

      const attendance = await findAttendanceById(attendanceId);
      if (!attendance || attendance.deployment.supervisorId !== profile.id) {
        return { status: 'error', code: 404, message: 'Attendance not found' };
      }
      if (attendance.verifiedAt !== null) {
        return { status: 'error', code: 409, message: 'Attendance already verified' };
      }

      const verified = await verifyAttendance(attendanceId, supervisorUserId, attendance.hoursRendered);
      if (!verified) {
        return { status: 'error', code: 404, message: 'Attendance not found' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Attendance verified successfully',
        data: { attendance: verified },
      };
    } catch (error) {
      console.error('verifyAttendanceService', error);
      return { status: 'error', code: 500, message: 'Failed to verify attendance' };
    }
  },
};
