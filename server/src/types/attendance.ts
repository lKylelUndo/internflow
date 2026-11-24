import type { infer as ZodInfer } from 'zod';
import type { Attendance, AttendanceStatus, DeploymentStatus } from '@/generated/prisma/client';
import type { attendanceIdSchema, createAttendanceSchema, listAttendancesSchema, updateAttendanceSchema } from '@/schemas/attendance';

export type AttendanceStudentSummary = {
  id: string;
  studentNumber: string;
  user: { firstName: string; lastName: string };
};

export type AttendanceDeployment = {
  id: string;
  status: DeploymentStatus;
  supervisorId: string;
  departmentId: string;
  studentProfile: AttendanceStudentSummary;
  company: { id: string; name: string };
  internship: { id: string; title: string };
};

export type AttendanceWithRelations = Attendance & { deployment: AttendanceDeployment };

export type CreateAttendanceInput = ZodInfer<typeof createAttendanceSchema>['body'];
export type UpdateAttendanceInput = ZodInfer<typeof updateAttendanceSchema>['body'];
export type AttendanceIdParams = ZodInfer<typeof attendanceIdSchema>['params'];
export type ListAttendancesQuery = ZodInfer<typeof listAttendancesSchema>['query'];
export type AttendanceFilters = { deploymentId?: string; status?: AttendanceStatus };

export type CreateAttendanceRecord = {
  deploymentId: string;
  date: Date;
  timeIn?: Date;
  timeOut?: Date;
  hoursRendered: number;
  status?: AttendanceStatus;
  remarks?: string;
};

export type UpdateAttendanceRecord = {
  timeIn?: Date | null;
  timeOut?: Date | null;
  hoursRendered?: number;
  status?: AttendanceStatus;
  remarks?: string | null;
};

export type AttendanceData = { attendance: AttendanceWithRelations };
export type ListAttendancesData = { attendances: AttendanceWithRelations[] };
