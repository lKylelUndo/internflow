import { AttendanceStatus, DeploymentStatus, Prisma } from '@/generated/prisma/client';
import { createAttendance } from '@/repositories/attendance.repository';
import { findDeploymentById } from '@/repositories/deployment.repository';
import { findStudentProfileByUserId } from '@/repositories/user.repository';
import type { AttendanceData, CreateAttendanceInput } from '@/types/attendance';
import type { ServiceResponse } from '@/types/api';

const normalizeDate = (value: Date | undefined | null): Date | null => {
  if (value === undefined || value === null) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const toUtcDate = (value: Date): Date =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

const computeHours = (timeIn: Date | null, timeOut: Date | null, status: AttendanceStatus): number => {
  if (status === AttendanceStatus.ABSENT || !timeIn || !timeOut) return 0;
  return Math.round(((timeOut.getTime() - timeIn.getTime()) / 3600000) * 100) / 100;
};

export const createAttendanceService = {
  execute: async (studentUserId: string, input: CreateAttendanceInput): Promise<ServiceResponse<AttendanceData>> => {
    try {
      const student = await findStudentProfileByUserId(studentUserId);
      if (!student) {
        return { status: 'error', code: 403, message: 'Student profile not found' };
      }

      const deployment = await findDeploymentById(input.deploymentId);
      if (!deployment || deployment.studentProfileId !== student.id) {
        return { status: 'error', code: 404, message: 'Deployment not found' };
      }
      if (
        deployment.status !== DeploymentStatus.DEPLOYED &&
        deployment.status !== DeploymentStatus.IN_PROGRESS
      ) {
        return { status: 'error', code: 400, message: 'Deployment is not active' };
      }

      const rawDate = normalizeDate(input.date);
      if (!rawDate) {
        return { status: 'error', code: 400, message: 'Invalid attendance date' };
      }
      const date = toUtcDate(rawDate);

      const timeIn = input.timeIn === undefined ? null : normalizeDate(input.timeIn);
      const timeOut = input.timeOut === undefined ? null : normalizeDate(input.timeOut);
      if ((input.timeIn !== undefined && !timeIn) || (input.timeOut !== undefined && !timeOut)) {
        return { status: 'error', code: 400, message: 'Invalid time value' };
      }
      if (timeIn && timeOut && timeOut <= timeIn) {
        return { status: 'error', code: 400, message: 'Time out must be after time in' };
      }

      const status = (input.status ?? AttendanceStatus.PRESENT) as AttendanceStatus;
      const attendance = await createAttendance({
        deploymentId: input.deploymentId,
        date,
        ...(timeIn && { timeIn }),
        ...(timeOut && { timeOut }),
        hoursRendered: computeHours(timeIn, timeOut, status),
        status,
        ...(input.remarks !== undefined && { remarks: input.remarks }),
      });

      return {
        status: 'success',
        code: 201,
        message: 'Attendance recorded successfully',
        data: { attendance },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { status: 'error', code: 409, message: 'Attendance already recorded for this date' };
      }

      console.error('createAttendanceService', error);
      return { status: 'error', code: 500, message: 'Failed to record attendance' };
    }
  },
};
