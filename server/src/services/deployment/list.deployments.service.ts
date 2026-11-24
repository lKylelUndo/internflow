import { RoleType, type DeploymentStatus } from '@/generated/prisma/client';
import { findDeploymentsByDepartment, findDeploymentsByStudent, findDeploymentsBySupervisor } from '@/repositories/deployment.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { ListDeploymentsData } from '@/types/deployment';
import type { ServiceResponse } from '@/types/api';

export const listDeploymentsService = {
  execute: async (
    userId: string,
    role: RoleType,
    status?: DeploymentStatus,
  ): Promise<ServiceResponse<ListDeploymentsData>> => {
    try {
      let deployments: ListDeploymentsData['deployments'];

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          deployments = await findDeploymentsByStudent(student.id, status);
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          deployments = await findDeploymentsBySupervisor(profile.id, status);
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          deployments = await findDeploymentsByDepartment(dean.departmentId, status);
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Deployments retrieved successfully',
        data: { deployments },
      };
    } catch (error) {
      console.error('listDeploymentsService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve deployments' };
    }
  },
};
