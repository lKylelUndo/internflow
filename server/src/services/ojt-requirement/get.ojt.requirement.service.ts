import { findRequirementById } from '@/repositories/ojt-requirement.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { OjtRequirementData } from '@/types/ojt-requirement';
import type { ServiceResponse } from '@/types/api';

export const getOjtRequirementService = {
  execute: async (
    deanUserId: string,
    requirementId: string,
  ): Promise<ServiceResponse<OjtRequirementData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const requirement = await findRequirementById(requirementId);
      if (!requirement || requirement.departmentId !== deanProfile.departmentId) {
        return { status: 'error', code: 404, message: 'OJT requirement not found' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'OJT requirement retrieved successfully',
        data: { requirement },
      };
    } catch (error) {
      console.error('getOjtRequirementService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve OJT requirement' };
    }
  },
};
