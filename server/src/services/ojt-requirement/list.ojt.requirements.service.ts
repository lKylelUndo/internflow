import { findRequirementsByDepartment } from '@/repositories/ojt-requirement.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { ListOjtRequirementsData } from '@/types/ojt-requirement';
import type { ServiceResponse } from '@/types/api';

export const listOjtRequirementsService = {
  execute: async (deanUserId: string): Promise<ServiceResponse<ListOjtRequirementsData>> => {
    try {
      const deanProfile = await findDeanProfileByUserId(deanUserId);
      if (!deanProfile) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const requirements = await findRequirementsByDepartment(deanProfile.departmentId);

      return {
        status: 'success',
        code: 200,
        message: 'OJT requirements retrieved successfully',
        data: { requirements },
      };
    } catch (error) {
      console.error('listOjtRequirementsService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve OJT requirements' };
    }
  },
};
