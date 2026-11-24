import { prisma } from '@/lib/prisma';
import type { CreateCompanyRecord, UpdateCompanyRecord } from '@/types/company';

export const findCompaniesByDepartment = (departmentId: string) =>
  prisma.company.findMany({
    where: { departmentId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { supervisors: true, internships: true } } },
  });

export const findCompanyById = (companyId: string) =>
  prisma.company.findUnique({ where: { id: companyId } });

export const findPublicCompaniesByDepartment = (departmentId: string) =>
  prisma.company.findMany({
    where: { departmentId, isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, address: true, description: true },
  });

export const createCompany = (input: CreateCompanyRecord) => prisma.company.create({ data: input });

export const updateCompany = (companyId: string, input: UpdateCompanyRecord) =>
  prisma.company.update({ where: { id: companyId }, data: input });
