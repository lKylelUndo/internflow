import { Prisma } from '@/generated/prisma/client';
import { createCompany } from '@/repositories/company.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { CompanyData, CreateCompanyInput } from '@/types/company';
import type { ServiceResponse } from '@/types/api';

export const createCompanyService = {
  execute: async (
    deanUserId: string,
    input: CreateCompanyInput,
  ): Promise<ServiceResponse<CompanyData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const company = await createCompany({ ...input, departmentId: deanProfile.departmentId });

      return {
        status: 'success',
        code: 201,
        message: 'Company created successfully',
        data: { company },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return {
          status: 'error',
          code: 409,
          message: 'A company with this name already exists in your department',
        };
      }

      console.error('createCompanyService', error);
      return { status: 'error', code: 500, message: 'Failed to create company' };
    }
  },
};
