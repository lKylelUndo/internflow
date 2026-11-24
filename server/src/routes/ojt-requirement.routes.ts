import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import ojtRequirementController from '@/controllers/ojt-requirement.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { createOjtRequirementSchema, ojtRequirementIdSchema, updateOjtRequirementSchema } from '@/schemas/ojt-requirement';

const ojtRequirementRoutes = Router();
const deanOnly = permittedRole([RoleType.DEAN]);

ojtRequirementRoutes.get('/', authMiddleware.execute, deanOnly, ojtRequirementController.listRequirements);
ojtRequirementRoutes.post('/', authMiddleware.execute, deanOnly, validateSchema(createOjtRequirementSchema), ojtRequirementController.createRequirement);
ojtRequirementRoutes.get('/:requirementId', authMiddleware.execute, deanOnly, validateSchema(ojtRequirementIdSchema), ojtRequirementController.getRequirement);
ojtRequirementRoutes.patch('/:requirementId', authMiddleware.execute, deanOnly, validateSchema(ojtRequirementIdSchema), validateSchema(updateOjtRequirementSchema), ojtRequirementController.updateRequirement);

export default ojtRequirementRoutes;
