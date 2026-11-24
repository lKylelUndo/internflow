import { AttendanceStatus } from '@/generated/prisma/client';
import { findAttendanceById, updateAttendance } from '@/repositories/attendance.repository';
import { findStudentProfileByUserId } from '@/repositories/user.repository';
import type { AttendanceData, UpdateAttendanceInput, UpdateAttendanceRecord } from '@/types/attendance';
import type { ServiceResponse } from '@/types/api';

const normalizeDate = (value: Date | undefined | null): Date | null => {
  if (value === undefined || value === null) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const computeHours = (timeIn: Date | null, timeOut: Date | null, status: AttendanceStatus): number => {
  if (status === AttendanceStatus.ABSENT || !timeIn || !timeOut) return 0;
  return Math.round(((timeOut.getTime() - timeIn.getTime()) / 3600000) * 100) / 100;
};

export const updateAttendanceService = {
  execute: async (
    studentUserId: string,
    attendanceId: string,
    input: UpdateAttendanceInput,
  ): Promise<ServiceResponse<AttendanceData>> => {
    try {
      const student = await findStudentProfileByUserId(studentUserId);
      if (!student) {
        return { status: 'error', code: 403, message: 'Student profile not found' };
      }

      const attendance = await findAttendanceById(attendanceId);
      if (!attendance || attendance.deployment.studentProfile.id !== student.id) {
        return { status: 'error', code: 404, message: 'Attendance not found' };
      }
      if (attendance.verifiedAt !== null) {
        return { status: 'error', code: 409, message: 'Verified attendance cannot be modified' };
      }

      let timeIn = attendance.timeIn;
      let timeOut = attendance.timeOut;
      if (input.timeIn !== undefined) {
        timeIn = normalizeDate(input.timeIn);
        if (!timeIn && input.timeIn !== null) {
          return { status: 'error', code: 400, message: 'Invalid time value' };
        }
      }
      if (input.timeOut !== undefined) {
        timeOut = normalizeDate(input.timeOut);
        if (!timeOut && input.timeOut !== null) {
          return { status: 'error', code: 400, message: 'Invalid time value' };
        }
      }

      const status = input.status === undefined
        ? (attendance.status as AttendanceStatus)
        : (input.status as AttendanceStatus);
      if (timeIn && timeOut && timeOut <= timeIn) {
        return { status: 'error', code: 400, message: 'Time out must be after time in' };
      }

      const record: UpdateAttendanceRecord = {
        hoursRendered: computeHours(timeIn, timeOut, status),
        ...(input.timeIn !== undefined && { timeIn }),
        ...(input.timeOut !== undefined && { timeOut }),
        ...(input.status !== undefined && { status }),
        ...(input.remarks !== undefined && { remarks: input.remarks }),
      };

      const updated = await updateAttendance(attendanceId, record);

      return {
        status: 'success',
        code: 200,
        message: 'Attendance updated successfully',
        data: { attendance: updated },
      };
    } catch (error) {
      console.error('updateAttendanceService', error);
      return { status: 'error', code: 500, message: 'Failed to update attendance' };
    }
  },
};
