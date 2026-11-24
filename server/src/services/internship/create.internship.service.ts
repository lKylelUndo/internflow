import { createInternship } from '@/repositories/internship.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import type { CreateInternshipInput, InternshipData } from '@/types/internship';
import type { ServiceResponse } from '@/types/api';

const parseDeadline = (value: Date | undefined): Date | undefined => {
  if (value === undefined) return undefined;
  return value instanceof Date ? value : new Date(String(value));
};

export const createInternshipService = {
  execute: async (userId: string, input: CreateInternshipInput): Promise<ServiceResponse<InternshipData>> => {
    try {
      const profile = await findSupervisorProfileByUserId(userId);
      if (!profile) {
        return { status: 'error', code: 403, message: 'Supervisor profile not found' };
      }
      if (!profile.company.isActive) {
        return { status: 'error', code: 400, message: 'Company is inactive' };
      }

      const deadline = parseDeadline(input.deadline);
      if (deadline && deadline <= new Date()) {
        return { status: 'error', code: 400, message: 'Deadline must be in the future' };
      }

      const internship = await createInternship({ ...input, companyId: profile.companyId, deadline });

      return {
        status: 'success',
        code: 201,
        message: 'Internship created successfully',
        data: { internship },
      };
    } catch (error) {
      console.error('createInternshipService', error);
      return { status: 'error', code: 500, message: 'Failed to create internship' };
    }
  },
};
