import { DeploymentStatus } from '@/generated/prisma/client';
import { completeDeployment, findDeploymentById } from '@/repositories/deployment.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import type { DeploymentData } from '@/types/deployment';
import type { ServiceResponse } from '@/types/api';

export const completeDeploymentService = {
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
      if (
        deployment.status !== DeploymentStatus.DEPLOYED &&
        deployment.status !== DeploymentStatus.IN_PROGRESS
      ) {
        return { status: 'error', code: 409, message: 'Only active deployments can be completed' };
      }

      const updated = await completeDeployment(deploymentId);

      return {
        status: 'success',
        code: 200,
        message: 'Deployment completed successfully',
        data: { deployment: updated },
      };
    } catch (error) {
      console.error('completeDeploymentService', error);
      return { status: 'error', code: 500, message: 'Failed to complete deployment' };
    }
  },
};
