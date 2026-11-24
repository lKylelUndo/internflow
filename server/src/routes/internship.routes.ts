import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import internshipController from '@/controllers/internship.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { createInternshipSchema, internshipIdSchema, listInternshipsSchema, updateInternshipSchema } from '@/schemas/internship';

const internshipRoutes = Router();
const readRoles = permittedRole([RoleType.DEAN, RoleType.COMPANY_SUPERVISOR, RoleType.STUDENT]);
const supervisorOnly = permittedRole([RoleType.COMPANY_SUPERVISOR]);

internshipRoutes.get('/', authMiddleware.execute, readRoles, validateSchema(listInternshipsSchema), internshipController.listInternships);
internshipRoutes.post('/', authMiddleware.execute, supervisorOnly, validateSchema(createInternshipSchema), internshipController.createInternship);
internshipRoutes.get('/:internshipId', authMiddleware.execute, readRoles, validateSchema(internshipIdSchema), internshipController.getInternship);
internshipRoutes.patch('/:internshipId', authMiddleware.execute, supervisorOnly, validateSchema(internshipIdSchema), validateSchema(updateInternshipSchema), internshipController.updateInternship);

export default internshipRoutes;
