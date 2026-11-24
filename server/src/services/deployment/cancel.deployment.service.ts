import { DeploymentStatus } from '@/generated/prisma/client';
import { cancelDeployment, findDeploymentById } from '@/repositories/deployment.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { CancelDeploymentInput, DeploymentData } from '@/types/deployment';
import type { ServiceResponse } from '@/types/api';

export const cancelDeploymentService = {
  execute: async (
    deanUserId: string,
    deploymentId: string,
    input: CancelDeploymentInput,
  ): Promise<ServiceResponse<DeploymentData>> => {
    try {
      const dean = await findDeanProfileByUserId(deanUserId);
      if (!dean) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const deployment = await findDeploymentById(deploymentId);
      if (!deployment || deployment.departmentId !== dean.departmentId) {
        return { status: 'error', code: 404, message: 'Deployment not found' };
      }
      if (
        deployment.status === DeploymentStatus.COMPLETED ||
        deployment.status === DeploymentStatus.CANCELLED
      ) {
        return { status: 'error', code: 409, message: 'Deployment cannot be cancelled' };
      }

      const updated = await cancelDeployment(deploymentId, input.cancelledReason);

      return {
        status: 'success',
        code: 200,
        message: 'Deployment cancelled successfully',
        data: { deployment: updated },
      };
    } catch (error) {
      console.error('cancelDeploymentService', error);
      return { status: 'error', code: 500, message: 'Failed to cancel deployment' };
    }
  },
};
