import { RoleType } from '@/generated/prisma/client';
import { findDeploymentById } from '@/repositories/deployment.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { DeploymentData } from '@/types/deployment';
import type { ServiceResponse } from '@/types/api';

export const getDeploymentService = {
  execute: async (
    userId: string,
    role: RoleType,
    deploymentId: string,
  ): Promise<ServiceResponse<DeploymentData>> => {
    try {
      const deployment = await findDeploymentById(deploymentId);
      if (!deployment) {
        return { status: 'error', code: 404, message: 'Deployment not found' };
      }

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          if (deployment.studentProfileId !== student.id) {
            return { status: 'error', code: 404, message: 'Deployment not found' };
          }
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          if (deployment.supervisorId !== profile.id) {
            return { status: 'error', code: 404, message: 'Deployment not found' };
          }
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          if (deployment.departmentId !== dean.departmentId) {
            return { status: 'error', code: 404, message: 'Deployment not found' };
          }
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Deployment retrieved successfully',
        data: { deployment },
      };
    } catch (error) {
      console.error('getDeploymentService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve deployment' };
    }
  },
};
