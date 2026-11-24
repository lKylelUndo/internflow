import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import reportController from '@/controllers/report.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { createReportSchema, listReportsSchema, reportIdSchema, reviewReportSchema, updateReportSchema } from '@/schemas/report';

const reportRoutes = Router();
const readRoles = permittedRole([RoleType.DEAN, RoleType.COMPANY_SUPERVISOR, RoleType.STUDENT]);
const studentOnly = permittedRole([RoleType.STUDENT]);
const supervisorOnly = permittedRole([RoleType.COMPANY_SUPERVISOR]);

reportRoutes.get('/', authMiddleware.execute, readRoles, validateSchema(listReportsSchema), reportController.listReports);
reportRoutes.post('/', authMiddleware.execute, studentOnly, validateSchema(createReportSchema), reportController.createReport);
reportRoutes.get('/:reportId', authMiddleware.execute, readRoles, validateSchema(reportIdSchema), reportController.getReport);
reportRoutes.patch('/:reportId', authMiddleware.execute, studentOnly, validateSchema(reportIdSchema), validateSchema(updateReportSchema), reportController.updateReport);
reportRoutes.patch('/:reportId/review', authMiddleware.execute, supervisorOnly, validateSchema(reportIdSchema), validateSchema(reviewReportSchema), reportController.reviewReport);

export default reportRoutes;
