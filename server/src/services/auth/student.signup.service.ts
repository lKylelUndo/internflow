import { Prisma } from '@/generated/prisma/client';
import { hashPassword } from '@/lib/bcrypt';
import { createStudentWithProfile, findByEmail, findProgramById } from '@/repositories/user.repository';
import { issueTokens } from '@/services/auth/issue.tokens.service';
import { getUniqueConstraintFields } from '@/utils/prisma-error';
import { sanitizeUser } from '@/utils/sanitize-user';
import type { StudentSignupData, StudentSignupInput } from '@/types/auth';
import type { ServiceResponse } from '@/types/api';

export const studentSignupService = {
  execute: async (input: StudentSignupInput): Promise<ServiceResponse<StudentSignupData>> => {
    const email = input.email.trim().toLowerCase();

    try {
      const existingUser = await findByEmail(email);
      if (existingUser) {
        return { status: 'error', code: 409, message: 'Email is already registered', path: 'email' };
      }

      const program = await findProgramById(input.programId);
      if (!program) {
        return { status: 'error', code: 400, message: 'Program not found', path: 'programId' };
      }

      const password = await hashPassword(input.password);
      const user = await createStudentWithProfile({
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        email,
        password,
        contactNumber: input.contactNumber,
        studentNumber: input.studentNumber,
        yearLevel: input.yearLevel,
        departmentId: program.departmentId,
        programId: program.id,
      });
      const tokens = await issueTokens(user);

      return {
        status: 'success',
        code: 201,
        message: 'Student account created successfully',
        data: { user: sanitizeUser(user), tokens },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        if (getUniqueConstraintFields(error).includes('studentNumber')) {
          return {
            status: 'error',
            code: 409,
            message: 'Student number is already registered',
            path: 'studentNumber',
          };
        }
        return { status: 'error', code: 409, message: 'Email is already registered', path: 'email' };
      }

      console.error('studentSignupService', error);
      return { status: 'error', code: 500, message: 'Failed to create student account' };
    }
  },
};
