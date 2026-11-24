import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import attendanceController from '@/controllers/attendance.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { attendanceIdSchema, createAttendanceSchema, listAttendancesSchema, updateAttendanceSchema } from '@/schemas/attendance';

const attendanceRoutes = Router();
const readRoles = permittedRole([RoleType.DEAN, RoleType.COMPANY_SUPERVISOR, RoleType.STUDENT]);
const studentOnly = permittedRole([RoleType.STUDENT]);
const supervisorOnly = permittedRole([RoleType.COMPANY_SUPERVISOR]);

attendanceRoutes.get('/', authMiddleware.execute, readRoles, validateSchema(listAttendancesSchema), attendanceController.listAttendances);
attendanceRoutes.post('/', authMiddleware.execute, studentOnly, validateSchema(createAttendanceSchema), attendanceController.createAttendance);
attendanceRoutes.get('/:attendanceId', authMiddleware.execute, readRoles, validateSchema(attendanceIdSchema), attendanceController.getAttendance);
attendanceRoutes.patch('/:attendanceId', authMiddleware.execute, studentOnly, validateSchema(attendanceIdSchema), validateSchema(updateAttendanceSchema), attendanceController.updateAttendance);
attendanceRoutes.patch('/:attendanceId/verify', authMiddleware.execute, supervisorOnly, validateSchema(attendanceIdSchema), attendanceController.verifyAttendance);

export default attendanceRoutes;
