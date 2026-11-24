import type { infer as ZodInfer } from 'zod';
import type { Company } from '@/generated/prisma/client';
import type { companyIdSchema, createCompanySchema, listPublicCompaniesSchema, updateCompanySchema } from '@/schemas/company';

export type CreateCompanyInput = ZodInfer<typeof createCompanySchema>['body'];
export type UpdateCompanyInput = ZodInfer<typeof updateCompanySchema>['body'];
export type CompanyIdParams = ZodInfer<typeof companyIdSchema>['params'];
export type ListPublicCompaniesQuery = ZodInfer<typeof listPublicCompaniesSchema>['query'];
export type CreateCompanyRecord = CreateCompanyInput & { departmentId: string };
export type UpdateCompanyRecord = UpdateCompanyInput;
export type PublicCompany = Pick<Company, 'id' | 'name' | 'address' | 'description'>;
export type CompanyWithCounts = Company & { _count: { supervisors: number; internships: number } };
export type CompanyData = { company: Company };
export type ListCompaniesData = { companies: CompanyWithCounts[] };
export type ListPublicCompaniesData = { companies: PublicCompany[] };
