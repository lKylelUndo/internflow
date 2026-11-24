import { prisma } from '@/lib/prisma';
import type { AttendanceFilters, CreateAttendanceRecord, UpdateAttendanceRecord } from '@/types/attendance';

const STUDENT_SELECT = {
  id: true,
  studentNumber: true,
  user: { select: { firstName: true, lastName: true } },
} as const;
const ATTENDANCE_INCLUDE = {
  deployment: {
    select: {
      id: true,
      status: true,
      supervisorId: true,
      departmentId: true,
      studentProfile: { select: STUDENT_SELECT },
      company: { select: { id: true, name: true } },
      internship: { select: { id: true, title: true } },
    },
  },
} as const;

export const findAttendanceById = (attendanceId: string) =>
  prisma.attendance.findUnique({ where: { id: attendanceId }, include: ATTENDANCE_INCLUDE });

export const findAttendanceByDeploymentAndDate = (deploymentId: string, date: Date) =>
  prisma.attendance.findUnique({
    where: { deploymentId_date: { deploymentId, date } },
    include: ATTENDANCE_INCLUDE,
  });

export const findAttendancesByStudent = (studentProfileId: string, filters: AttendanceFilters) =>
  prisma.attendance.findMany({
    where: {
      deployment: { studentProfileId },
      ...(filters.deploymentId && { deploymentId: filters.deploymentId }),
      ...(filters.status && { status: filters.status }),
    },
    include: ATTENDANCE_INCLUDE,
    orderBy: { date: 'desc' },
  });

export const findAttendancesBySupervisor = (supervisorId: string, filters: AttendanceFilters) =>
  prisma.attendance.findMany({
    where: {
      deployment: { supervisorId },
      ...(filters.deploymentId && { deploymentId: filters.deploymentId }),
      ...(filters.status && { status: filters.status }),
    },
    include: ATTENDANCE_INCLUDE,
    orderBy: { date: 'desc' },
  });

export const findAttendancesByDepartment = (departmentId: string, filters: AttendanceFilters) =>
  prisma.attendance.findMany({
    where: {
      deployment: { departmentId },
      ...(filters.deploymentId && { deploymentId: filters.deploymentId }),
      ...(filters.status && { status: filters.status }),
    },
    include: ATTENDANCE_INCLUDE,
    orderBy: { date: 'desc' },
  });

export const createAttendance = (record: CreateAttendanceRecord) =>
  prisma.attendance.create({ data: record, include: ATTENDANCE_INCLUDE });

export const updateAttendance = (attendanceId: string, record: UpdateAttendanceRecord) =>
  prisma.attendance.update({
    where: { id: attendanceId },
    data: record,
    include: ATTENDANCE_INCLUDE,
  });

export const verifyAttendance = (attendanceId: string, verifierUserId: string, hoursRendered: number) =>
  prisma.$transaction(async (tx) => {
    const attendance = await tx.attendance.update({
      where: { id: attendanceId },
      data: { verifiedById: verifierUserId, verifiedAt: new Date() },
    });
    await tx.deployment.update({
      where: { id: attendance.deploymentId },
      data: { completedHours: { increment: hoursRendered } },
    });
    return tx.attendance.findUnique({ where: { id: attendanceId }, include: ATTENDANCE_INCLUDE });
  });
