import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import deploymentController from '@/controllers/deployment.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { cancelDeploymentSchema, createDeploymentSchema, deploymentIdSchema, listDeploymentsSchema } from '@/schemas/deployment';

const deploymentRoutes = Router();
const readRoles = permittedRole([RoleType.DEAN, RoleType.COMPANY_SUPERVISOR, RoleType.STUDENT]);
const deanOnly = permittedRole([RoleType.DEAN]);
const supervisorOnly = permittedRole([RoleType.COMPANY_SUPERVISOR]);

deploymentRoutes.get('/', authMiddleware.execute, readRoles, validateSchema(listDeploymentsSchema), deploymentController.listDeployments);
deploymentRoutes.post('/', authMiddleware.execute, deanOnly, validateSchema(createDeploymentSchema), deploymentController.createDeployment);
deploymentRoutes.get('/:deploymentId', authMiddleware.execute, readRoles, validateSchema(deploymentIdSchema), deploymentController.getDeployment);
deploymentRoutes.patch('/:deploymentId/accept', authMiddleware.execute, supervisorOnly, validateSchema(deploymentIdSchema), deploymentController.acceptDeployment);
deploymentRoutes.patch('/:deploymentId/complete', authMiddleware.execute, supervisorOnly, validateSchema(deploymentIdSchema), deploymentController.completeDeployment);
deploymentRoutes.patch('/:deploymentId/cancel', authMiddleware.execute, deanOnly, validateSchema(deploymentIdSchema), validateSchema(cancelDeploymentSchema), deploymentController.cancelDeployment);

export default deploymentRoutes;
