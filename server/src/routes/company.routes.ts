import { Router } from 'express';
import { RoleType } from '@/generated/prisma/client';
import companyController from '@/controllers/company.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { permittedRole } from '@/middlewares/rbac-middleware';
import { validateSchema } from '@/middlewares/validate-schema';
import { companyIdSchema, createCompanySchema, listPublicCompaniesSchema, updateCompanySchema } from '@/schemas/company';

const companyRoutes = Router();
const deanOnly = permittedRole([RoleType.DEAN]);

// Public — registered before '/:companyId'.
companyRoutes.get('/public', validateSchema(listPublicCompaniesSchema), companyController.listPublicCompanies);

// Dean-only
companyRoutes.get('/', authMiddleware.execute, deanOnly, companyController.listCompanies);
companyRoutes.post('/', authMiddleware.execute, deanOnly, validateSchema(createCompanySchema), companyController.createCompany);
companyRoutes.get('/:companyId', authMiddleware.execute, deanOnly, validateSchema(companyIdSchema), companyController.getCompany);
companyRoutes.patch('/:companyId', authMiddleware.execute, deanOnly, validateSchema(companyIdSchema), validateSchema(updateCompanySchema), companyController.updateCompany);

export default companyRoutes;
