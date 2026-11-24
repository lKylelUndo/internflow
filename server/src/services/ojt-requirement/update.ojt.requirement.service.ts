import { Prisma } from '@/generated/prisma/client';
import { findRequirementByDepartmentAndProgram, findRequirementById, updateRequirement } from '@/repositories/ojt-requirement.repository';
import { findDeanProfileByUserId, findProgramById } from '@/repositories/user.repository';
import type { OjtRequirementData, UpdateOjtRequirementInput, UpdateOjtRequirementRecord } from '@/types/ojt-requirement';
import type { ServiceResponse } from '@/types/api';

export const updateOjtRequirementService = {
  execute: async (
    deanUserId: string,
    requirementId: string,
    input: UpdateOjtRequirementInput,
  ): Promise<ServiceResponse<OjtRequirementData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const existing = await findRequirementById(requirementId);
      if (!existing || existing.departmentId !== deanProfile.departmentId) {
        return { status: 'error', code: 404, message: 'OJT requirement not found' };
      }

      const programId = input.programId !== undefined ? input.programId : existing.programId;
      if (programId) {
        const program = await findProgramById(programId);
        if (!program || program.departmentId !== deanProfile.departmentId) {
          return { status: 'error', code: 400, message: 'Program not found in your department' };
        }
      }

      const duplicate = await findRequirementByDepartmentAndProgram(deanProfile.departmentId, programId);
      if (duplicate && duplicate.id !== requirementId) {
        return { status: 'error', code: 409, message: 'An OJT requirement already exists for this program' };
      }

      const data: UpdateOjtRequirementRecord = {
        ...(input.requiredHours !== undefined && { requiredHours: input.requiredHours }),
        ...(input.requiredDocuments !== undefined && {
          requiredDocuments: input.requiredDocuments.map((document) => document.trim()),
        }),
        ...(input.programId !== undefined && { programId: input.programId }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      };

      const requirement = await updateRequirement(requirementId, data);

      return {
        status: 'success',
        code: 200,
        message: 'OJT requirement updated successfully',
        data: { requirement },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { status: 'error', code: 409, message: 'An OJT requirement already exists for this program' };
      }

      console.error('updateOjtRequirementService', error);
      return { status: 'error', code: 500, message: 'Failed to update OJT requirement' };
    }
  },
};
