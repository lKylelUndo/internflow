import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import studentController from '@/controllers/student.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { listStudentsSchema, studentIdSchema, updateEligibilitySchema } from '@/schemas/student';

const studentRoutes = Router();
const deanOnly = permittedRole([RoleType.DEAN]);

studentRoutes.get('/', authMiddleware.execute, deanOnly, validateSchema(listStudentsSchema), studentController.listStudents);
studentRoutes.get('/:userId', authMiddleware.execute, deanOnly, validateSchema(studentIdSchema), studentController.getStudent);
studentRoutes.patch('/:userId/eligibility', authMiddleware.execute, deanOnly, validateSchema(studentIdSchema), validateSchema(updateEligibilitySchema), studentController.updateEligibility);

export default studentRoutes;
