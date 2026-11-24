import { Prisma } from '@/generated/prisma/client';
import { hashPassword } from '@/lib/bcrypt';
import { findCompanyById } from '@/repositories/company.repository';
import { createSupervisorWithProfile, findByEmail } from '@/repositories/user.repository';
import { sanitizeUser } from '@/utils/sanitize-user';
import type { SupervisorSignupData, SupervisorSignupInput } from '@/types/auth';
import type { ServiceResponse } from '@/types/api';

export const supervisorSignupService = {
  execute: async (input: SupervisorSignupInput): Promise<ServiceResponse<SupervisorSignupData>> => {
    const email = input.email.trim().toLowerCase();

    try {
      const company = await findCompanyById(input.companyId);
      if (!company || !company.isActive) {
        return {
          status: 'error',
          code: 400,
          message: 'Company not found or inactive',
          path: 'companyId',
        };
      }

      const existingUser = await findByEmail(email);
      if (existingUser) {
        return { status: 'error', code: 409, message: 'Email is already registered', path: 'email' };
      }

      const password = await hashPassword(input.password);
      const user = await createSupervisorWithProfile({
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        email,
        password,
        contactNumber: input.contactNumber,
        companyId: company.id,
        position: input.position,
      });

      return {
        status: 'success',
        code: 201,
        message: 'Supervisor account submitted for verification',
        data: { user: sanitizeUser(user) },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { status: 'error', code: 409, message: 'Email is already registered', path: 'email' };
      }

      console.error('supervisorSignupService', error);
      return { status: 'error', code: 500, message: 'Failed to submit supervisor account' };
    }
  },
};
