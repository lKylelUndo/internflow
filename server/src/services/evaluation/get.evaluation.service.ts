import { RoleType } from '@/generated/prisma/client';
import { findEvaluationById } from '@/repositories/evaluation.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { EvaluationData } from '@/types/evaluation';
import type { ServiceResponse } from '@/types/api';

export const getEvaluationService = {
  execute: async (
    userId: string,
    role: RoleType,
    evaluationId: string,
  ): Promise<ServiceResponse<EvaluationData>> => {
    try {
      const evaluation = await findEvaluationById(evaluationId);
      if (!evaluation) {
        return { status: 'error', code: 404, message: 'Evaluation not found' };
      }

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          if (evaluation.deployment.studentProfile.id !== student.id) {
            return { status: 'error', code: 404, message: 'Evaluation not found' };
          }
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          if (evaluation.deployment.supervisorId !== profile.id) {
            return { status: 'error', code: 404, message: 'Evaluation not found' };
          }
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          if (evaluation.deployment.departmentId !== dean.departmentId) {
            return { status: 'error', code: 404, message: 'Evaluation not found' };
          }
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Evaluation retrieved successfully',
        data: { evaluation },
      };
    } catch (error) {
      console.error('getEvaluationService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve evaluation' };
    }
  },
};
