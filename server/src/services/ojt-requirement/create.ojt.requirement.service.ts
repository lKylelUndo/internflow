import { Prisma } from '@/generated/prisma/client';
import { createRequirement, findRequirementByDepartmentAndProgram } from '@/repositories/ojt-requirement.repository';
import { findDeanProfileByUserId, findProgramById } from '@/repositories/user.repository';
import type { CreateOjtRequirementInput, OjtRequirementData } from '@/types/ojt-requirement';
import type { ServiceResponse } from '@/types/api';

export const createOjtRequirementService = {
  execute: async (
    deanUserId: string,
    input: CreateOjtRequirementInput,
  ): Promise<ServiceResponse<OjtRequirementData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const programId = input.programId ?? null;
      if (programId) {
        const program = await findProgramById(programId);
        if (!program || program.departmentId !== deanProfile.departmentId) {
          return { status: 'error', code: 400, message: 'Program not found in your department' };
        }
      }

      const duplicate = await findRequirementByDepartmentAndProgram(deanProfile.departmentId, programId);
      if (duplicate) {
        return { status: 'error', code: 409, message: 'An OJT requirement already exists for this program' };
      }

      const requirement = await createRequirement({
        departmentId: deanProfile.departmentId,
        programId,
        requiredHours: input.requiredHours,
        requiredDocuments: (input.requiredDocuments ?? []).map((document) => document.trim()),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      });

      return {
        status: 'success',
        code: 201,
        message: 'OJT requirement created successfully',
        data: { requirement },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { status: 'error', code: 409, message: 'An OJT requirement already exists for this program' };
      }

      console.error('createOjtRequirementService', error);
      return { status: 'error', code: 500, message: 'Failed to create OJT requirement' };
    }
  },
};
