import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import adminController from '@/controllers/admin.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { deanUserIdSchema, listDeansSchema } from '@/schemas/admin';

const adminRoutes = Router();
const adminOnly = permittedRole([RoleType.ADMIN]);

adminRoutes.get(
  '/deans',
  authMiddleware.execute,
  adminOnly,
  validateSchema(listDeansSchema),
  adminController.listDeans,
);
adminRoutes.patch(
  '/deans/:userId/verify',
  authMiddleware.execute,
  adminOnly,
  validateSchema(deanUserIdSchema),
  adminController.verifyDean,
);
adminRoutes.patch(
  '/deans/:userId/suspend',
  authMiddleware.execute,
  adminOnly,
  validateSchema(deanUserIdSchema),
  adminController.suspendDean,
);

export default adminRoutes;
