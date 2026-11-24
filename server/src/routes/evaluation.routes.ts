import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import evaluationController from '@/controllers/evaluation.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { createEvaluationSchema, evaluationIdSchema, listEvaluationsSchema, updateEvaluationSchema } from '@/schemas/evaluation';

const evaluationRoutes = Router();
const readRoles = permittedRole([RoleType.DEAN, RoleType.COMPANY_SUPERVISOR, RoleType.STUDENT]);
const supervisorOnly = permittedRole([RoleType.COMPANY_SUPERVISOR]);
const deanOnly = permittedRole([RoleType.DEAN]);

evaluationRoutes.get('/', authMiddleware.execute, readRoles, validateSchema(listEvaluationsSchema), evaluationController.listEvaluations);
evaluationRoutes.post('/', authMiddleware.execute, supervisorOnly, validateSchema(createEvaluationSchema), evaluationController.createEvaluation);
evaluationRoutes.get('/:evaluationId', authMiddleware.execute, readRoles, validateSchema(evaluationIdSchema), evaluationController.getEvaluation);
evaluationRoutes.patch('/:evaluationId', authMiddleware.execute, supervisorOnly, validateSchema(evaluationIdSchema), validateSchema(updateEvaluationSchema), evaluationController.updateEvaluation);
evaluationRoutes.patch('/:evaluationId/review', authMiddleware.execute, deanOnly, validateSchema(evaluationIdSchema), evaluationController.reviewEvaluation);

export default evaluationRoutes;
