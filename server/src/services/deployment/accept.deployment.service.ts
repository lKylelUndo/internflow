import { DeploymentStatus } from '@/generated/prisma/client';
import { acceptDeployment, findDeploymentById } from '@/repositories/deployment.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import type { DeploymentData } from '@/types/deployment';
import type { ServiceResponse } from '@/types/api';

export const acceptDeploymentService = {
  execute: async (supervisorUserId: string, deploymentId: string): Promise<ServiceResponse<DeploymentData>> => {
    try {
      const profile = await findSupervisorProfileByUserId(supervisorUserId);
      if (!profile) {
        return { status: 'error', code: 403, message: 'Supervisor profile not found' };
      }

      const deployment = await findDeploymentById(deploymentId);
      if (!deployment || deployment.supervisorId !== profile.id) {
        return { status: 'error', code: 404, message: 'Deployment not found' };
      }
      if (deployment.status !== DeploymentStatus.PENDING_ACCEPTANCE) {
        return { status: 'error', code: 409, message: 'Only deployments pending acceptance can be accepted' };
      }

      const updated = await acceptDeployment(deploymentId);

      return {
        status: 'success',
        code: 200,
        message: 'Deployment accepted successfully',
        data: { deployment: updated },
      };
    } catch (error) {
      console.error('acceptDeploymentService', error);
      return { status: 'error', code: 500, message: 'Failed to accept deployment' };
    }
  },
};
