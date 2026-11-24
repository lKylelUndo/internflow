import { findInternshipById, updateInternship } from '@/repositories/internship.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import type { InternshipData, UpdateInternshipInput } from '@/types/internship';
import type { ServiceResponse } from '@/types/api';

const parseDeadline = (value: Date | null | undefined): Date | null | undefined => {
  if (value === undefined || value === null) return value;
  return value instanceof Date ? value : new Date(String(value));
};

export const updateInternshipService = {
  execute: async (
    userId: string,
    internshipId: string,
    input: UpdateInternshipInput,
  ): Promise<ServiceResponse<InternshipData>> => {
    try {
      const profile = await findSupervisorProfileByUserId(userId);
      if (!profile) {
        return { status: 'error', code: 403, message: 'Supervisor profile not found' };
      }

      const internship = await findInternshipById(internshipId);
      if (!internship || internship.companyId !== profile.companyId) {
        return { status: 'error', code: 404, message: 'Internship not found' };
      }

      const deadline = parseDeadline(input.deadline);
      if (deadline && deadline <= new Date()) {
        return { status: 'error', code: 400, message: 'Deadline must be in the future' };
      }

      const updated = await updateInternship(internshipId, {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.slots !== undefined && { slots: input.slots }),
        ...(input.isOpen !== undefined && { isOpen: input.isOpen }),
        ...(input.deadline !== undefined && { deadline }),
      });

      return {
        status: 'success',
        code: 200,
        message: 'Internship updated successfully',
        data: { internship: updated },
      };
    } catch (error) {
      console.error('updateInternshipService', error);
      return { status: 'error', code: 500, message: 'Failed to update internship' };
    }
  },
};
