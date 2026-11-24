import type { infer as ZodInfer } from 'zod';
import type { Company, Internship } from '@/generated/prisma/client';
import type { createInternshipSchema, internshipIdSchema, listInternshipsSchema, updateInternshipSchema } from '@/schemas/internship';

export type InternshipWithCompany = Internship & { company: Pick<Company, 'id' | 'name' | 'departmentId' | 'isActive'> };
export type CreateInternshipInput = ZodInfer<typeof createInternshipSchema>['body'];
export type UpdateInternshipInput = ZodInfer<typeof updateInternshipSchema>['body'];
export type InternshipIdParams = ZodInfer<typeof internshipIdSchema>['params'];
export type ListInternshipsQuery = ZodInfer<typeof listInternshipsSchema>['query'];
export type CreateInternshipRecord = CreateInternshipInput & { companyId: string };
export type UpdateInternshipRecord = UpdateInternshipInput;
export type InternshipData = { internship: InternshipWithCompany };
export type ListInternshipsData = { internships: InternshipWithCompany[] };
