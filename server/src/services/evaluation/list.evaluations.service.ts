import { RoleType } from '@/generated/prisma/client';
import { findEvaluationsByDepartment, findEvaluationsByStudent, findEvaluationsBySupervisor } from '@/repositories/evaluation.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId, findStudentProfileByUserId } from '@/repositories/user.repository';
import type { EvaluationFilters, ListEvaluationsData } from '@/types/evaluation';
import type { ServiceResponse } from '@/types/api';

export const listEvaluationsService = {
  execute: async (
    userId: string,
    role: RoleType,
    filters: EvaluationFilters,
  ): Promise<ServiceResponse<ListEvaluationsData>> => {
    try {
      let evaluations: ListEvaluationsData['evaluations'];

      switch (role) {
        case RoleType.STUDENT: {
          const student = await findStudentProfileByUserId(userId);
          if (!student) {
            return { status: 'error', code: 403, message: 'Student profile not found' };
          }
          evaluations = await findEvaluationsByStudent(student.id, filters);
          break;
        }
        case RoleType.COMPANY_SUPERVISOR: {
          const profile = await findSupervisorProfileByUserId(userId);
          if (!profile) {
            return { status: 'error', code: 403, message: 'Supervisor profile not found' };
          }
          evaluations = await findEvaluationsBySupervisor(profile.id, filters);
          break;
        }
        case RoleType.DEAN: {
          const dean = await findDeanProfileByUserId(userId);
          if (!dean) {
            return { status: 'error', code: 403, message: 'Dean profile not found' };
          }
          evaluations = await findEvaluationsByDepartment(dean.departmentId, filters);
          break;
        }
        default:
          return { status: 'error', code: 403, message: 'Forbidden' };
      }

      return {
        status: 'success',
        code: 200,
        message: 'Evaluations retrieved successfully',
        data: { evaluations },
      };
    } catch (error) {
      console.error('listEvaluationsService', error);
      return { status: 'error', code: 500, message: 'Failed to retrieve evaluations' };
    }
  },
};
