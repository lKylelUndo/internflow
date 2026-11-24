import { Prisma } from '@/generated/prisma/client';
import { findCompanyById, updateCompany } from '@/repositories/company.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { CompanyData, UpdateCompanyInput } from '@/types/company';
import type { ServiceResponse } from '@/types/api';

export const updateCompanyService = {
  execute: async (
    deanUserId: string,
    companyId: string,
    input: UpdateCompanyInput,
  ): Promise<ServiceResponse<CompanyData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const company = await findCompanyById(companyId);
      if (!company || company.departmentId !== deanProfile.departmentId) {
        return { status: 'error', code: 404, message: 'Company not found' };
      }

      const updated = await updateCompany(companyId, input);

      return {
        status: 'success',
        code: 200,
        message: 'Company updated successfully',
        data: { company: updated },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return {
          status: 'error',
          code: 409,
          message: 'A company with this name already exists in your department',
        };
      }

      console.error('updateCompanyService', error);
      return { status: 'error', code: 500, message: 'Failed to update company' };
    }
  },
};
