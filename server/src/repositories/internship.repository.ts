import { prisma } from '@/lib/prisma';
import type { CreateInternshipRecord, UpdateInternshipRecord } from '@/types/internship';

const COMPANY_SELECT = { id: true, name: true, departmentId: true, isActive: true } as const;

export const findInternshipsByCompany = (companyId: string, isOpen?: boolean) =>
  prisma.internship.findMany({
    where: { companyId, ...(isOpen !== undefined && { isOpen }) },
    include: { company: { select: COMPANY_SELECT } },
    orderBy: { createdAt: 'desc' },
  });

export const findInternshipsByDepartment = (departmentId: string, isOpen?: boolean) =>
  prisma.internship.findMany({
    where: { company: { departmentId }, ...(isOpen !== undefined && { isOpen }) },
    include: { company: { select: COMPANY_SELECT } },
    orderBy: { createdAt: 'desc' },
  });

export const findOpenInternshipsByDepartment = (departmentId: string) =>
  prisma.internship.findMany({
    where: {
      isOpen: true,
      company: { departmentId, isActive: true },
      OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
    },
    include: { company: { select: COMPANY_SELECT } },
    orderBy: { createdAt: 'desc' },
  });

export const findInternshipById = (internshipId: string) =>
  prisma.internship.findUnique({
    where: { id: internshipId },
    include: { company: { select: COMPANY_SELECT } },
  });

export const createInternship = (input: CreateInternshipRecord) =>
  prisma.internship.create({ data: input, include: { company: { select: COMPANY_SELECT } } });

export const updateInternship = (internshipId: string, input: UpdateInternshipRecord) =>
  prisma.internship.update({
    where: { id: internshipId },
    data: input,
    include: { company: { select: COMPANY_SELECT } },
  });
