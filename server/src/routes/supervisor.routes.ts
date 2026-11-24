import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import supervisorController from '@/controllers/supervisor.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { listSupervisorsSchema, supervisorUserIdSchema } from '@/schemas/supervisor';

const supervisorRoutes = Router();
const deanOnly = permittedRole([RoleType.DEAN]);

supervisorRoutes.get('/', authMiddleware.execute, deanOnly, validateSchema(listSupervisorsSchema), supervisorController.listSupervisors);
supervisorRoutes.patch('/:userId/verify', authMiddleware.execute, deanOnly, validateSchema(supervisorUserIdSchema), supervisorController.verifySupervisor);
supervisorRoutes.patch('/:userId/suspend', authMiddleware.execute, deanOnly, validateSchema(supervisorUserIdSchema), supervisorController.suspendSupervisor);

export default supervisorRoutes;
