import { Prisma } from '@/generated/prisma/client';
import { hashPassword } from '@/lib/bcrypt';
import { findDepartmentById } from '@/repositories/academic.repository';
import { createDeanWithProfile, findByEmail } from '@/repositories/user.repository';
import { sanitizeUser } from '@/utils/sanitize-user';
import type { DeanSignupData, DeanSignupInput } from '@/types/auth';
import type { ServiceResponse } from '@/types/api';

const uniqueConstraintFields = (error: Prisma.PrismaClientKnownRequestError): string => {
  const target = error.meta?.target;
  return Array.isArray(target) ? target.join(',') : String(target ?? '');
};

export const deanSignupService = {
  execute: async (input: DeanSignupInput): Promise<ServiceResponse<DeanSignupData>> => {
    const email = input.email.trim().toLowerCase();

    try {
      const department = await findDepartmentById(input.departmentId);
      if (!department) {
        return { status: 'error', code: 400, message: 'Department not found', path: 'departmentId' };
      }

      const existingUser = await findByEmail(email);
      if (existingUser) {
        return { status: 'error', code: 409, message: 'Email is already registered', path: 'email' };
      }

      const password = await hashPassword(input.password);
      const user = await createDeanWithProfile({
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        email,
        password,
        contactNumber: input.contactNumber,
        departmentId: department.id,
      });

      return {
        status: 'success',
        code: 201,
        message: 'Dean account submitted for verification',
        data: { user: sanitizeUser(user) },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        if (uniqueConstraintFields(error).includes('departmentId')) {
          return {
            status: 'error',
            code: 409,
            message: 'A dean is already registered for this department',
            path: 'departmentId',
          };
        }
        return { status: 'error', code: 409, message: 'Email is already registered', path: 'email' };
      }

      console.error('deanSignupService', error);
      return { status: 'error', code: 500, message: 'Failed to submit dean account' };
    }
  },
};
