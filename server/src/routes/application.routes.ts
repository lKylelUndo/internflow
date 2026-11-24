import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import applicationController from '@/controllers/application.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { applicationIdSchema, createApplicationSchema, listApplicationsSchema, reviewApplicationSchema } from '@/schemas/application';

const applicationRoutes = Router();
const readRoles = permittedRole([RoleType.DEAN, RoleType.COMPANY_SUPERVISOR, RoleType.STUDENT]);
const studentOnly = permittedRole([RoleType.STUDENT]);
const supervisorOnly = permittedRole([RoleType.COMPANY_SUPERVISOR]);

applicationRoutes.get('/', authMiddleware.execute, readRoles, validateSchema(listApplicationsSchema), applicationController.listApplications);
applicationRoutes.post('/', authMiddleware.execute, studentOnly, validateSchema(createApplicationSchema), applicationController.createApplication);
applicationRoutes.get('/:applicationId', authMiddleware.execute, readRoles, validateSchema(applicationIdSchema), applicationController.getApplication);
applicationRoutes.patch('/:applicationId/review', authMiddleware.execute, supervisorOnly, validateSchema(applicationIdSchema), validateSchema(reviewApplicationSchema), applicationController.reviewApplication);
applicationRoutes.patch('/:applicationId/withdraw', authMiddleware.execute, studentOnly, validateSchema(applicationIdSchema), applicationController.withdrawApplication);

export default applicationRoutes;
