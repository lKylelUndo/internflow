import { EvaluationStatus } from '@/generated/prisma/client';
import { findEvaluationById, reviewEvaluation } from '@/repositories/evaluation.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { EvaluationData } from '@/types/evaluation';
import type { ServiceResponse } from '@/types/api';

export const reviewEvaluationService = {
  execute: async (deanUserId: string, evaluationId: string): Promise<ServiceResponse<EvaluationData>> => {
    try {
      const dean = await findDeanProfileByUserId(deanUserId);
      if (!dean) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const evaluation = await findEvaluationById(evaluationId);
      if (!evaluation || evaluation.deployment.departmentId !== dean.departmentId) {
        return { status: 'error', code: 404, message: 'Evaluation not found' };
      }
      if (evaluation.status !== EvaluationStatus.SUBMITTED) {
        return { status: 'error', code: 409, message: 'Only submitted evaluations can be reviewed' };
      }

      const updated = await reviewEvaluation(evaluationId, deanUserId);

      return {
        status: 'success',
        code: 200,
        message: 'Evaluation reviewed successfully',
        data: { evaluation: updated },
      };
    } catch (error) {
      console.error('reviewEvaluationService', error);
      return { status: 'error', code: 500, message: 'Failed to review evaluation' };
    }
  },
};
